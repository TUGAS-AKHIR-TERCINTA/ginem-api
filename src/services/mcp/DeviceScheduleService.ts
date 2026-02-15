import { DeviceService } from '../DeviceServices'
import { DeviceValueService } from '../DeviceValueServices'
import { SchedulerLogModel } from '../../models/SchedulerLogModel'
import logger from '../../../logs'

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
      const deviceValue = await DeviceValueService.create({
        deviceValueDeviceId: device.deviceId,
        deviceValueValue: value
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
        deviceValueId: deviceValue.deviceValueId,
        deviceValueValue: deviceValue.deviceValueValue,
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
      const items = await DeviceValueService.getLastValuesByDeviceId(device.deviceId, 10)
      job.status = 'completed'
      job.result = {
        deviceName: job.deviceName,
        deviceId: device.deviceId,
        count: items.length,
        values: items.map((v) => ({
          deviceValueId: v.deviceValueId,
          deviceValueValue: v.deviceValueValue,
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

  void SchedulerLogModel.create({
    jobId: id,
    type: 'actuator',
    deviceName,
    state: state ?? null,
    delayMinutes,
    scheduledAt,
    runAt,
    status: 'pending'
  }).catch((e) =>
    logger.error('[DeviceScheduleService] Failed to record scheduled job:', e)
  )

  const delayMs = delayMinutes * 60 * 1000
  setTimeout(() => {
    runActuatorJob(job)
  }, delayMs)

  return job
}

/**
 * Schedule fetching sensor/device data after a delay (minutes).
 * Returns job id. When time comes, last 10 values are fetched and stored in job.result.
 * User can get result via getScheduledJob(id).
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

  void SchedulerLogModel.create({
    jobId: id,
    type: 'sensor_data',
    deviceName,
    state: null,
    delayMinutes,
    scheduledAt,
    runAt,
    status: 'pending'
  }).catch((e) =>
    logger.error('[DeviceScheduleService] Failed to record scheduled job:', e)
  )

  const delayMs = delayMinutes * 60 * 1000
  setTimeout(() => {
    runSensorDataJob(job)
  }, delayMs)

  return job
}

/**
 * Get a scheduled job by id (status and result when completed/failed).
 * Returns a plain object without internal refs for serialization.
 */
export function getScheduledJob(jobId: string): ScheduledJob | undefined {
  const job = jobs.get(jobId)
  if (job == null) return undefined
  return {
    id: job.id,
    type: job.type,
    deviceName: job.deviceName,
    state: job.state,
    delayMinutes: job.delayMinutes,
    scheduledAt: job.scheduledAt,
    runAt: job.runAt,
    status: job.status,
    result: job.result,
    error: job.error
  }
}

/**
 * List recent scheduled jobs (e.g. last 50).
 */
export function listScheduledJobs(limit = 50): ScheduledJob[] {
  const list = Array.from(jobs.values())
  list.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
  return list.slice(0, limit)
}
