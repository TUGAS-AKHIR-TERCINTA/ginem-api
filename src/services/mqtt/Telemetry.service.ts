import { DeviceLogService } from '../DeviceLog.service'
import { DeviceModel } from '../../models/DeviceModel'
import { MQTTService } from './MQTT.service'
import logger from '../../utilities/logger'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../../utilities/AppError'

function extractValueAsString (payload: unknown): string | null {
  if (payload != null && typeof payload === 'object' && 'value' in payload) {
    const raw = (payload as { value: unknown }).value
    if (raw === undefined || raw === null) {
      return null
    }
    return String(raw)
  }
  return null
}

export class TelemetryService {
  static initialize () {
    MQTTService.onDeviceTelemetry(async (deviceId: number, payload: unknown) => {
      try {
        console.log('payload', payload)
        const existingDevice = await DeviceModel.findOne({
          where: { deviceId, deleted: 0 }
        })

        if (existingDevice == null) {
          logger.warn(
            `[TelemetryService] Device ${deviceId} not found, ignoring telemetry`
          )
          return
        }

        const deviceLogData = extractValueAsString(payload)

        if (deviceLogData == null) {
          logger.warn(
            `[TelemetryService] Missing or invalid "value" in telemetry payload for device ${deviceId}`
          )
          return
        }

        await DeviceLogService.create({
          deviceLogDeviceId: deviceId,
          deviceLogData
        })
      } catch (serviceError) {
        if (serviceError instanceof AppError) throw serviceError
        logger.error(`[TelemetryService] create failed: ${String(serviceError)}`)
        throw new AppError(
          'Failed to create telemetry',
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      }
    })
  }
}
