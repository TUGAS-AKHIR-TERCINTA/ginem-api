import logger from '../../utilities/logger'
import { mqttClient } from './client'
import { ALL_DEVICE_STATUS, deviceCommandTopic } from './topics'

export function subscribeToAllDeviceStatus() {
  mqttClient.subscribe(ALL_DEVICE_STATUS, () => {
    logger.info('Subscribed to all device status topics')
  })
}

export function subscribeToDeviceCommand(deviceName: string) {
  mqttClient.subscribe(deviceCommandTopic(deviceName), () => {
    logger.info(`Subscribed to ${deviceName} command topic`)
  })
}
