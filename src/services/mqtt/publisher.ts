import logger from '../../utilities/logger'
import { mqttClient } from './client'
import { deviceCommandTopic, deviceStateTopic, deviceTelemetryTopic } from './topics'

/** Command and telemetry topics use the same JSON envelope: `{ "value": string }`. */
export function toMqttValueEnvelope (payload: unknown): { value: string } {
  if (payload != null && typeof payload === 'object' && 'value' in (payload)) {
    const v = (payload as { value: unknown }).value
    return { value: v == null ? '' : String(v) }
  }
  if (payload == null) {
    return { value: '' }
  }
  return { value: String(payload) }
}

export function publishDeviceCommand (deviceId: number, command: string): void {
  try {
    mqttClient.publish(
      deviceCommandTopic(deviceId),
      JSON.stringify(toMqttValueEnvelope(command))
    )
  } catch (error) {
    logger.error(`Failed to publish command to ${deviceId}`, error)
  }
}

export function publishDeviceState (deviceId: number, state: string): void {
  try {
    mqttClient.publish(deviceStateTopic(deviceId), JSON.stringify({ state }))
  } catch (error) {
    logger.error(`Failed to publish status to ${deviceId}`, error)
  }
}

export function publishDeviceTelemetry (deviceId: number, telemetry: unknown): void {
  try {
    mqttClient.publish(
      deviceTelemetryTopic(deviceId),
      JSON.stringify(toMqttValueEnvelope(telemetry))
    )
  } catch (error) {
    logger.error(`Failed to publish telemetry to ${deviceId}`, error)
  }
}
