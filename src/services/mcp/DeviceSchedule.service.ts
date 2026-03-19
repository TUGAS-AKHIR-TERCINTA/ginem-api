import { DeviceService } from '../Device.service'
import {
  SchedulerLogModel,
  ISchedulerLogCreationModelAttributes
} from '../../models/SchedulerLogModel'
import logger from '../../../logs'
import { DeviceLogService } from '../DeviceLog.service'

export type ScheduledJobType = 'actuator' | 'sensor_data'
export type ScheduledJobStatus = 'pending' | 'completed' | 'failed'

export interface ScheduledJob {
  id: string
  type: ScheduledJobType
  deviceName: string
  state?: 'on' | 'off'
  delayMinutes: number
  scheduledAt: Date
  runAt: Date
  status: ScheduledJobStatus
  result?: unknown
  error?: string
}

const jobs = new Map<string, ScheduledJob>()
let jobIdCounter = 0

function nextJobId(): string {
  jobIdCounter += 1
  return `schedule-${Date.now()}-${jobIdCounter}`
}

async function recordSchedulerResult(
  jobId: string,
  status: ScheduledJobStatus,
  result?: unknown,
  error?: string
): Promise<void> {
  try {
    await SchedulerLogModel.update(
      {
        status,
        result: result != null ? (result as object) : null,
        error: error ?? null,
        executedAt: new Date()
      },
      { where: { jobId, deleted: 0 } }
    )
  } catch (e) {
    logger.error(
      `[DeviceScheduleService] Failed to record scheduler result for ${jobId}:`,
      e
    )
  }
}

function runActuatorJob(job: ScheduledJob): void {
  void (async () => {
    try {
      const device = await DeviceService.findByName(job.deviceName)

      if (device == null) {
        job.status = 'failed'
        job.error = `Device not found: ${job.deviceName}`
        await recordSchedulerResult(job.id, 'failed', undefined, job.error)
        return
      }

      if (device.deviceType !== 'actuator') {
        job.status = 'failed'
        job.error = `Device "${job.deviceName}" is not an actuator (type: ${device.deviceType})`
        await recordSchedulerResult(job.id, 'failed', undefined, job.error)
        return
      }

      const value = job.state === 'on' ? '1' : '0'

      const deviceValue = await DeviceLogService.create({
        deviceLogDeviceId: device.deviceId,
        deviceLogData: value
      })

      job.status = 'completed'
      job.result = {
        success: true,
        message:
          job.state === 'on'
            ? 'Device turned on (value 1)'
            : 'Device turned off (value 0)',
        deviceName: job.deviceName,
        deviceId: device.deviceId,
        deviceLogId: deviceValue.deviceLogId,
        deviceLogData: deviceValue.deviceLogData,
        executedAt: new Date().toISOString()
      }

      await recordSchedulerResult(job.id, 'completed', job.result)

      logger.info(
        `[DeviceScheduleService] Actuator job ${job.id} executed: ${job.deviceName} -> ${job.state}`
      )
    } catch (err) {
      job.status = 'failed'
      job.error = err instanceof Error ? err.message : String(err)
      await recordSchedulerResult(job.id, 'failed', undefined, job.error)
      logger.error(`[DeviceScheduleService] Actuator job ${job.id} failed:`, err)
    }
  })()
}

function runSensorDataJob(job: ScheduledJob): void {
  void (async () => {
    try {
      const device = await DeviceService.findByName(job.deviceName)

      if (device == null) {
        job.status = 'failed'
        job.error = `Device not found: ${job.deviceName}`
        await recordSchedulerResult(job.id, 'failed', undefined, job.error)
        return
      }

      const items = await DeviceLogService.getLastLogsByDeviceId(device.deviceId, 10)

      job.status = 'completed'
      job.result = {
        deviceName: job.deviceName,
        deviceId: device.deviceId,
        count: items.length,
        values: items.map((v) => ({
          deviceLogId: v.deviceLogId,
          deviceLogData: v.deviceLogData,
          createdAt: v.createdAt
        })),
        executedAt: new Date().toISOString()
      }

      await recordSchedulerResult(job.id, 'completed', job.result)
      logger.info(
        `[DeviceScheduleService] Sensor data job ${job.id} executed: ${job.deviceName}`
      )
    } catch (err) {
      job.status = 'failed'
      job.error = err instanceof Error ? err.message : String(err)
      await recordSchedulerResult(job.id, 'failed', undefined, job.error)
      logger.error(`[DeviceScheduleService] Sensor data job ${job.id} failed:`, err)
    }
  })()
}

/**
 * Schedule turning on/off an actuator after a delay (minutes).
 * Returns job id. The action runs in the background after delayMinutes.
 */
export function scheduleActuatorState(
  deviceName: string,
  state: 'on' | 'off',
  delayMinutes: number
): ScheduledJob {
  const id = nextJobId()
  const scheduledAt = new Date()
  const runAt = new Date(scheduledAt.getTime() + delayMinutes * 60 * 1000)

  const job: ScheduledJob = {
    id,
    type: 'actuator',
    deviceName,
    state,
    delayMinutes,
    scheduledAt,
    runAt,
    status: 'pending'
  }

  jobs.set(id, job)

  const createPayload: ISchedulerLogCreationModelAttributes = {
    jobId: id,
    type: 'actuator',
    deviceName,
    state,
    delayMinutes,
    scheduledAt,
    runAt,
    status: 'pending'
  }

  void SchedulerLogModel.create(createPayload).then(() => {
    setTimeout(() => runActuatorJob(job), delayMinutes * 60 * 1000)
  })

  return job
}

/**
 * Schedule fetching sensor/device data after a delay (minutes).
 * Returns job id. After the delay, the job runs and stores the result; use getScheduledJob(id) to get it.
 */
export function scheduleSensorData(
  deviceName: string,
  delayMinutes: number
): ScheduledJob {
  const id = nextJobId()
  const scheduledAt = new Date()
  const runAt = new Date(scheduledAt.getTime() + delayMinutes * 60 * 1000)

  const job: ScheduledJob = {
    id,
    type: 'sensor_data',
    deviceName,
    delayMinutes,
    scheduledAt,
    runAt,
    status: 'pending'
  }

  jobs.set(id, job)

  const createPayload: ISchedulerLogCreationModelAttributes = {
    jobId: id,
    type: 'sensor_data',
    deviceName,
    delayMinutes,
    scheduledAt,
    runAt,
    status: 'pending'
  }

  void SchedulerLogModel.create(createPayload).then(() => {
    setTimeout(() => runSensorDataJob(job), delayMinutes * 60 * 1000)
  })

  return job
}

/**
 * Get a scheduled job by id (from memory).
 */
export function getScheduledJob(jobId: string): ScheduledJob | null {
  return jobs.get(jobId) ?? null
}

/**
 * List recent scheduled jobs (pending, completed, or failed).
 */
export function listScheduledJobs(limit: number = 20): ScheduledJob[] {
  const list = Array.from(jobs.values())
  list.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
  return list.slice(0, limit)
}
