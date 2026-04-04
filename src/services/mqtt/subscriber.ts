import { MqttClient } from 'mqtt/*'
import logger from '../../utilities/logger'
import { mqttClient } from './client'
import { ALL_DEVICE_STATE, deviceCommandTopic, deviceTelemetryTopic } from './topics'

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
  mqttClient.subscribe('iot/v1/device/+/telemetry', () => {
    logger.info('Subscribed to all device telemetry topics')
  })
}
