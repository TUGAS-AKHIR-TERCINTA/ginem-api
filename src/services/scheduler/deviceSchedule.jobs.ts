import { DeviceService } from '../Device.service'
import { SchedulerLogModel, type SchedulerCategory } from '../../models/SchedulerLogModel'
import logger from '../../utilities/logger'
import { DeviceLogService } from '../DeviceLog.service'
import { MQTTService } from '../mqtt/MQTT.service'
import type { DeviceScheduleJobData } from './deviceSchedule.queue'

export type ScheduledJobStatus = 'pending' | 'active' | 'completed' | 'failed'

async function recordSchedulerResult (
  jobId: string,
  status: ScheduledJobStatus,
  category: SchedulerCategory,
  result?: unknown,
  error?: string
): Promise<void> {
  const finalStatus = category === 'repeat' && status === 'completed' ? 'active' : status

  try {
    await SchedulerLogModel.update(
      {
        status: finalStatus,
        result: result != null ? (result as object) : null,
        error: error ?? null,
        executedAt: new Date()
      },
      { where: { jobId, deleted: 0 } }
    )
  } catch (e) {
    logger.error(
      `[DeviceScheduleJobs] Failed to record scheduler result for ${jobId}:`,
      e
    )
  }
}

export async function executeActuatorJob (data: DeviceScheduleJobData): Promise<void> {
  const { jobId, deviceName, state, category } = data

  try {
    const device = await DeviceService.findByName(deviceName)

    if (device.deviceType !== 'actuator') {
      const error = `Device "${deviceName}" is not an actuator (type: ${device.deviceType})`
      await recordSchedulerResult(jobId, 'failed', category, undefined, error)
      return
    }

    if (state !== 'on' && state !== 'off') {
      const error = `Invalid actuator state for job ${jobId}`
      await recordSchedulerResult(jobId, 'failed', category, undefined, error)
      return
    }

    const value = state === 'on' ? '1' : '0'

    const deviceValue = await DeviceLogService.create({
      deviceLogDeviceId: device.deviceId,
      deviceLogData: value
    })

    MQTTService.publishActuatorState(device.deviceId, state)

    const result = {
      success: true,
      category,
      message:
        state === 'on' ? 'Device turned on (value 1)' : 'Device turned off (value 0)',
      deviceName,
      deviceId: device.deviceId,
      deviceLogId: deviceValue.deviceLogId,
      deviceLogData: deviceValue.deviceLogData,
      executedAt: new Date().toISOString(),
      mqtt: {
        topic: `iot/v1/device/${device.deviceId}/command`,
        value,
        brokerConnected: MQTTService.isConnected()
      }
    }

    await recordSchedulerResult(jobId, 'completed', category, result)

    logger.info(
      `[DeviceScheduleJobs] Actuator job ${jobId} (${category}) executed: ${deviceName} -> ${state}`
    )
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    await recordSchedulerResult(jobId, 'failed', category, undefined, error)
    logger.error(`[DeviceScheduleJobs] Actuator job ${jobId} failed:`, err)
    throw err
  }
}

export async function executeSensorDataJob (data: DeviceScheduleJobData): Promise<void> {
  const { jobId, deviceName, category } = data

  try {
    const device = await DeviceService.findByName(deviceName)
    const items = await DeviceLogService.findLastLogsByDeviceId(device.deviceId, 10)

    const result = {
      category,
      deviceName,
      deviceId: device.deviceId,
      count: items.length,
      values: items.map((v) => ({
        deviceLogId: v.deviceLogId,
        deviceLogData: v.deviceLogData,
        createdAt: v.createdAt
      })),
      executedAt: new Date().toISOString()
    }

    await recordSchedulerResult(jobId, 'completed', category, result)

    logger.info(
      `[DeviceScheduleJobs] Sensor data job ${jobId} (${category}) executed: ${deviceName}`
    )
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    await recordSchedulerResult(jobId, 'failed', category, undefined, error)
    logger.error(`[DeviceScheduleJobs] Sensor data job ${jobId} failed:`, err)
    throw err
  }
}
