import {
  SchedulerLogModel,
  ISchedulerLogCreationModelAttributes,
  type SchedulerLogInstance
} from '../../models/SchedulerLogModel'
import logger from '../../utilities/logger'
import {
  enqueueDeviceScheduleJob,
  type DeviceScheduleJobData
} from '../scheduler/deviceSchedule.queue'
import { minutesUntilRun } from '../scheduler/deviceSchedule.datetime'
import { startDeviceScheduleWorker } from '../scheduler/deviceSchedule.worker'

export type ScheduledJobType = 'actuator' | 'sensor_data'
export type ScheduledJobStatus = 'pending' | 'completed' | 'failed'

export interface ScheduledJob {
  id: string
  type: ScheduledJobType
  deviceName: string
  state?: 'on' | 'off'
  scheduledAt: Date
  runAt: Date
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
    deviceName: row.deviceName,
    state: (row.state as 'on' | 'off' | null) ?? undefined,
    scheduledAt: row.scheduledAt,
    runAt: row.runAt,
    status: row.status as ScheduledJobStatus,
    result: row.result ?? undefined,
    error: row.error ?? undefined
  }
}

async function persistAndEnqueueJob(
  job: ScheduledJob,
  queueData: DeviceScheduleJobData
): Promise<void> {
  const delayMinutes = minutesUntilRun(job.scheduledAt, job.runAt)

  const createPayload: ISchedulerLogCreationModelAttributes = {
    jobId: job.id,
    type: job.type,
    deviceName: job.deviceName,
    state: job.state ?? null,
    delayMinutes,
    scheduledAt: job.scheduledAt,
    runAt: job.runAt,
    status: 'pending'
  }

  await SchedulerLogModel.create(createPayload)
  await enqueueDeviceScheduleJob(queueData, job.runAt)
}

/**
 * Schedule turning on/off an actuator at an absolute datetime (WIB).
 */
export async function scheduleActuatorState(
  deviceName: string,
  state: 'on' | 'off',
  runAt: Date
): Promise<ScheduledJob> {
  const id = nextJobId()
  const scheduledAt = new Date()

  const job: ScheduledJob = {
    id,
    type: 'actuator',
    deviceName,
    state,
    scheduledAt,
    runAt,
    status: 'pending'
  }

  await persistAndEnqueueJob(job, {
    jobId: id,
    type: 'actuator',
    deviceName,
    state
  })

  return job
}

/**
 * Schedule fetching sensor/device data at an absolute datetime (WIB).
 */
export async function scheduleSensorData(
  deviceName: string,
  runAt: Date
): Promise<ScheduledJob> {
  const id = nextJobId()
  const scheduledAt = new Date()

  const job: ScheduledJob = {
    id,
    type: 'sensor_data',
    deviceName,
    scheduledAt,
    runAt,
    status: 'pending'
  }

  await persistAndEnqueueJob(job, {
    jobId: id,
    type: 'sensor_data',
    deviceName
  })

  return job
}

/**
 * Get a scheduled job by id (from database).
 */
export async function getScheduledJob(jobId: string): Promise<ScheduledJob | null> {
  const row = await SchedulerLogModel.findOne({
    where: { jobId, deleted: 0 }
  })

  return row == null ? null : toScheduledJob(row)
}

/**
 * List recent scheduled jobs (pending, completed, or failed).
 */
export async function listScheduledJobs(limit: number = 20): Promise<ScheduledJob[]> {
  const rows = await SchedulerLogModel.findAll({
    where: { deleted: 0 },
    order: [['scheduledAt', 'DESC']],
    limit
  })

  return rows.map(toScheduledJob)
}

/**
 * Re-enqueue pending jobs from DB (e.g. after Redis flush, restart, or missed run time).
 */
async function recoverPendingJobs(): Promise<void> {
  const pending = await SchedulerLogModel.findAll({
    where: {
      deleted: 0,
      status: 'pending'
    }
  })

  const now = Date.now()

  for (const row of pending) {
    const queueData: DeviceScheduleJobData = {
      jobId: row.jobId,
      type: row.type as ScheduledJobType,
      deviceName: row.deviceName,
      state: (row.state as 'on' | 'off' | null) ?? undefined
    }

    const runAt = row.runAt.getTime() <= now ? new Date() : row.runAt
    await enqueueDeviceScheduleJob(queueData, runAt)
  }

  if (pending.length > 0) {
    logger.info(`[DeviceScheduleService] Recovered ${pending.length} pending job(s)`)
  }
}

/**
 * Start BullMQ worker and recover pending jobs. Call once at app startup.
 */
export async function initializeDeviceSchedule(): Promise<void> {
  startDeviceScheduleWorker()
  await recoverPendingJobs()
  logger.info('[DeviceScheduleService] Initialized')
}
