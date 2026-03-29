import logger from '../../utilities/logger'
import { mqttClient } from './client'
import { deviceCommandTopic, deviceStatusTopic } from './topics'

export function publishDeviceCommand(deviceId: string, command: string): void {
  try {
    mqttClient.publish(deviceCommandTopic(deviceId), JSON.stringify({ command }))
  } catch (error) {
    logger.error(`Failed to publish command to ${deviceId}`, error)
  }
}

export function publishDeviceStatus(deviceId: string, status: string): void {
  try {
    mqttClient.publish(deviceStatusTopic(deviceId), JSON.stringify({ status }))
  } catch (error) {
    logger.error(`Failed to publish status to ${deviceId}`, error)
  }
}
