import mqtt, { type IClientOptions } from 'mqtt'
import { mqttConfig } from '../../configs/mqtt'
import logger from '../../utilities/logger'

const connectOptions: IClientOptions = {
  clientId: mqttConfig.clientId,
  clean: true,
  reconnectPeriod: 2000
}

if (mqttConfig.username !== undefined && mqttConfig.username !== '') {
  connectOptions.username = mqttConfig.username
}

if (mqttConfig.password !== undefined && mqttConfig.password !== '') {
  connectOptions.password = mqttConfig.password
}

export const mqttClient = mqtt.connect(mqttConfig.brokerUrl, connectOptions)

mqttClient.on('connect', () => {
  logger.info('Connected to MQTT broker')
})

mqttClient.on('reconnect', () => {
  logger.warn('Reconnecting to MQTT broker...')
})

mqttClient.on('error', (err) => {
  logger.error('MQTT error', err)
})
