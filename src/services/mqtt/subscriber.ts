import logger from '../../utilities/logger'
import { mqttClient } from './client'
import { ALL_DEVICE_STATUS, deviceCommandTopic } from './topics'

export function subscribeToAllDeviceStatus() {
  mqttClient.subscribe(ALL_DEVICE_STATUS, () => {
    logger.info('Subscribed to all device status topics')
  })
}

export function subscribeToDeviceCommand(deviceId: string) {
  mqttClient.subscribe(deviceCommandTopic(deviceId), () => {
    logger.info(`Subscribed to ${deviceId} command topic`)
  })
}
