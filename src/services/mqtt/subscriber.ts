import { MqttClient } from 'mqtt/*'
import logger from '../../utilities/logger'
import { mqttClient } from './client'
import { ALL_DEVICE_STATE, ALL_DEVICE_TELEMETRY, deviceCommandTopic, deviceTelemetryTopic } from './topics'

export function subscribeToAllDeviceStatus() {
  mqttClient.subscribe(ALL_DEVICE_STATE, () => {
    logger.info('Subscribed to all device status topics')
  })
}

export function subscribeToDeviceCommand(deviceId: number) {
  mqttClient.subscribe(deviceCommandTopic(deviceId), () => {
    logger.info(`Subscribed to ${deviceId} command topic`)
  })
}

export function subscribeToDeviceTelemetry(deviceId: number) {
  mqttClient.subscribe(deviceTelemetryTopic(deviceId), () => {
    logger.info(`Subscribed to ${deviceId} telemetry topic`)
  })
}

export function subscribeToAllDeviceTelemetry() {
  mqttClient.subscribe(ALL_DEVICE_TELEMETRY, () => {
    logger.info('Subscribed to all device telemetry topics')
  })
}
