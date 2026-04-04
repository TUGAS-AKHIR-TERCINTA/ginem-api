import logger from '../../utilities/logger'
import { mqttClient } from './client'
import { deviceCommandTopic, deviceStateTopic, deviceTelemetryTopic } from './topics'

export function publishDeviceCommand(deviceId: number, command: string): void {
  try {
    mqttClient.publish(deviceCommandTopic(deviceId), JSON.stringify({ command }))
  } catch (error) {
    logger.error(`Failed to publish command to ${deviceId}`, error)
  }
}

export function publishDeviceState(deviceId: number, state: string): void {
  try {
    mqttClient.publish(deviceStateTopic(deviceId), JSON.stringify({ state }))
  } catch (error) {
    logger.error(`Failed to publish status to ${deviceId}`, error)
  }
}

export function publishDeviceTelemetry(deviceId: number, telemetry: unknown): void {
  try {
    mqttClient.publish(deviceTelemetryTopic(deviceId), JSON.stringify(telemetry))
  } catch (error) {
    logger.error(`Failed to publish telemetry to ${deviceId}`, error)
  }
}
