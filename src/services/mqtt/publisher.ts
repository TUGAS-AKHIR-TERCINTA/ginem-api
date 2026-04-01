import logger from '../../utilities/logger'
import { mqttClient } from './client'
import { deviceCommandTopic, deviceStatusTopic } from './topics'

export function publishDeviceCommand(deviceName: string, command: string): void {
  try {
    mqttClient.publish(deviceCommandTopic(deviceName), JSON.stringify({ command }))
  } catch (error) {
    logger.error(`Failed to publish command to ${deviceName}`, error)
  }
}

export function publishDeviceStatus(deviceName: string, status: string): void {
  try {
    mqttClient.publish(deviceStatusTopic(deviceName), JSON.stringify({ status }))
  } catch (error) {
    logger.error(`Failed to publish status to ${deviceName}`, error)
  }
}
