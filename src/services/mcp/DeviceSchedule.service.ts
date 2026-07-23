import {
  SchedulerLogModel,
  type ISchedulerLogCreationModelAttributes,
  type SchedulerCategory,
  type SchedulerLogInstance
} from '../../models/SchedulerLogModel'
import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'
import {
  enqueueDeviceScheduleJob,
  enqueueRepeatDeviceScheduleJob,
  listRepeatableDeviceScheduleJobs,
  type DeviceScheduleJobData
} from '../scheduler/deviceSchedule.queue'
import {
  buildDailyCronPattern,
  minutesUntilRun,
  resolveNextDailyRun,
  WIB_SCHEDULE_TIMEZONE
} from '../scheduler/deviceSchedule.datetime'
import { startDeviceScheduleWorker } from '../scheduler/deviceSchedule.worker'

export type ScheduledJobType = 'actuator' | 'sensor_data'
export type ScheduledJobStatus = 'pending' | 'active' | 'completed' | 'failed'

export interface ScheduledJob {
  id: string
  type: ScheduledJobType
  category: SchedulerCategory
  deviceName: string
  state?: 'on' | 'off'
  scheduledAt: Date
  runAt: Date
  cronPattern?: string
  timezone: string
  status: ScheduledJobStatus
  result?: unknown
  error?: string
}

let jobIdCounter = 0

function nextJobId(): string {
  jobIdCounter += 1
  return `schedule-${Date.now()}-${jobIdCounter}`
}

function toScheduledJob(row: SchedulerLogInstance): ScheduledJob {
  return {
    id: row.jobId,
    type: row.type as ScheduledJobType,
    category: row.category,
    deviceName: row.deviceName,
    state: (row.state as 'on' | 'off' | null) ?? undefined,
    scheduledAt: row.scheduledAt,
    runAt: row.runAt,
    cronPattern: row.cronPattern ?? undefined,
    timezone: row.timezone,
    status: row.status as ScheduledJobStatus,
    result: row.result ?? undefined,
    error: row.error ?? undefined
  }
}

async function persistOnceJob(
  job: ScheduledJob,
  queueData: DeviceScheduleJobData
): Promise<void> {
  const delayMinutes = minutesUntilRun(job.scheduledAt, job.runAt)

  const createPayload: ISchedulerLogCreationModelAttributes = {
    jobId: job.id,
    type: job.type,
    category: 'once',
    deviceName: job.deviceName,
    state: job.state ?? null,
    delayMinutes,
    scheduledAt: job.scheduledAt,
    runAt: job.runAt,
    cronPattern: null,
    timezone: WIB_SCHEDULE_TIMEZONE,
    status: 'pending'
  }

  await SchedulerLogModel.create(createPayload)
  await enqueueDeviceScheduleJob(queueData, job.runAt)
}

async function persistRepeatJob(
  job: ScheduledJob,
  queueData: DeviceScheduleJobData,
  cronPattern: string
): Promise<void> {
  const createPayload: ISchedulerLogCreationModelAttributes = {
    jobId: job.id,
    type: job.type,
    category: 'repeat',
    deviceName: job.deviceName,
    state: job.state ?? null,
    delayMinutes: 0,
    scheduledAt: job.scheduledAt,
    runAt: job.runAt,
    cronPattern,
    timezone: WIB_SCHEDULE_TIMEZONE,
    status: 'active'
  }

  await SchedulerLogModel.create(createPayload)
  await enqueueRepeatDeviceScheduleJob(queueData, cronPattern, WIB_SCHEDULE_TIMEZONE)
}

/**
 * Schedule turning on/off an actuator (once or daily repeat).
 */
export async function scheduleActuatorState(
  deviceName: string,
  state: 'on' | 'off',
  category: SchedulerCategory,
  runAt: Date,
  cronPattern?: string
): Promise<ScheduledJob> {
  const id = nextJobId()
  const scheduledAt = new Date()

  const job: ScheduledJob = {
    id,
    type: 'actuator',
    category,
    deviceName,
    state,
    scheduledAt,
    runAt,
    cronPattern,
    timezone: WIB_SCHEDULE_TIMEZONE,
    status: category === 'repeat' ? 'active' : 'pending'
  }

  const queueData: DeviceScheduleJobData = {
    jobId: id,
    type: 'actuator',
    category,
    deviceName,
    state
  }

  if (category === 'repeat') {
    if (cronPattern == null) {
      throw AppError.badRequest('cronPattern is required for repeat schedules')
    }
    await persistRepeatJob(job, queueData, cronPattern)
  } else {
    await persistOnceJob(job, queueData)
  }

  return job
}

/**
 * Schedule daily repeat for actuator on/off at hour:minute WIB.
 */
export async function scheduleActuatorStateRepeat(
  deviceName: string,
  state: 'on' | 'off',
  hour: number,
  minute: number
): Promise<ScheduledJob> {
  const next = resolveNextDailyRun(hour, minute)
  const cronPattern = buildDailyCronPattern(hour, minute)
  return await scheduleActuatorState(deviceName, state, 'repeat', next.runAt, cronPattern)
}

/**
 * Schedule fetching sensor/device data (once or daily repeat).
 */
export async function scheduleSensorData(
  deviceName: string,
  category: SchedulerCategory,
  runAt: Date,
  cronPattern?: string
): Promise<ScheduledJob> {
  const id = nextJobId()
  const scheduledAt = new Date()

  const job: ScheduledJob = {
    id,
    type: 'sensor_data',
    category,
    deviceName,
    scheduledAt,
    runAt,
    cronPattern,
    timezone: WIB_SCHEDULE_TIMEZONE,
    status: category === 'repeat' ? 'active' : 'pending'
  }

  const queueData: DeviceScheduleJobData = {
    jobId: id,
    type: 'sensor_data',
    category,
    deviceName
  }

  if (category === 'repeat') {
    if (cronPattern == null) {
      throw AppError.badRequest('cronPattern is required for repeat schedules')
    }
    await persistRepeatJob(job, queueData, cronPattern)
  } else {
    await persistOnceJob(job, queueData)
  }

  return job
}

/**
 * Schedule daily repeat for sensor data at hour:minute WIB.
 */
export async function scheduleSensorDataRepeat(
  deviceName: string,
  hour: number,
  minute: number
): Promise<ScheduledJob> {
  const next = resolveNextDailyRun(hour, minute)
  const cronPattern = buildDailyCronPattern(hour, minute)
  return await scheduleSensorData(deviceName, 'repeat', next.runAt, cronPattern)
}

export async function getScheduledJob(jobId: string): Promise<ScheduledJob | null> {
  const row = await SchedulerLogModel.findOne({
    where: { jobId, deleted: 0 }
  })

  return row == null ? null : toScheduledJob(row)
}

export async function listScheduledJobs(limit: number = 20): Promise<ScheduledJob[]> {
  const rows = await SchedulerLogModel.findAll({
    where: { deleted: 0 },
    order: [['scheduledAt', 'DESC']],
    limit
  })

  return rows.map(toScheduledJob)
}

async function recoverPendingOnceJobs(): Promise<void> {
  const pending = await SchedulerLogModel.findAll({
    where: {
      deleted: 0,
      category: 'once',
      status: 'pending'
    }
  })

  const now = Date.now()

  for (const row of pending) {
    const queueData: DeviceScheduleJobData = {
      jobId: row.jobId,
      type: row.type as ScheduledJobType,
      category: 'once',
      deviceName: row.deviceName,
      state: (row.state as 'on' | 'off' | null) ?? undefined
    }

    const runAt = row.runAt.getTime() <= now ? new Date() : row.runAt
    await enqueueDeviceScheduleJob(queueData, runAt)
  }

  if (pending.length > 0) {
    logger.info(`[DeviceScheduleService] Recovered ${pending.length} once job(s)`)
  }
}

async function recoverActiveRepeatJobs(): Promise<void> {
  const activeRepeats = await SchedulerLogModel.findAll({
    where: {
      deleted: 0,
      category: 'repeat',
      status: 'active'
    }
  })

  if (activeRepeats.length === 0) {
    return
  }

  const repeatables = await listRepeatableDeviceScheduleJobs()

  for (const row of activeRepeats) {
    const alreadyRegistered = repeatables.some(
      (entry) => entry.id === row.jobId || entry.key.includes(row.jobId)
    )

    if (alreadyRegistered || row.cronPattern == null) {
      continue
    }

    const queueData: DeviceScheduleJobData = {
      jobId: row.jobId,
      type: row.type as ScheduledJobType,
      category: 'repeat',
      deviceName: row.deviceName,
      state: (row.state as 'on' | 'off' | null) ?? undefined
    }

    await enqueueRepeatDeviceScheduleJob(
      queueData,
      row.cronPattern,
      row.timezone ?? WIB_SCHEDULE_TIMEZONE
    )
  }

  logger.info('[DeviceScheduleService] Recovered repeat job(s) from DB')
}

export async function initializeDeviceSchedule(): Promise<void> {
  startDeviceScheduleWorker()
  await recoverPendingOnceJobs()
  await recoverActiveRepeatJobs()
  logger.info('[DeviceScheduleService] Initialized')
}
