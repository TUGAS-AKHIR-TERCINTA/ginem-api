import logger from '../../utilities/logger'
import { mqttClient } from './client'

export function registerMqttHandlers() {
  mqttClient.on('message', (topic: string, payload: Buffer) => {
    try {
      const message = payload.toString()
      logger.info(`MQTT message [${topic}] ${message}`)
    } catch (err) {
      logger.error('Failed to handle MQTT message', err)
    }
  })
}
