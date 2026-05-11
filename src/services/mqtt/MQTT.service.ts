import { mqttClient } from './client'
import {
  publishDeviceCommand,
  publishDeviceState,
  publishDeviceTelemetry,
  toMqttValueEnvelope
} from './publisher'
import {
  subscribeToAllDeviceStatus,
  subscribeToAllDeviceTelemetry,
  subscribeToDeviceCommand,
  subscribeToDeviceTelemetry
} from './subscriber'
import logger from '../../utilities/logger'

export type MqttMessageListener = (deviceId: number, payload: unknown) => void

/** Last known status for a device (from MQTT or from API publish). */
export type LastDeviceStateRecord = {
  deviceId: number
  payload: unknown
  receivedAt: string
}

const STATE_TOPIC_PATTERN = /^iot\/v1\/device\/([^/]+)\/state$/
const COMMAND_TOPIC_PATTERN = /^iot\/v1\/device\/([^/]+)\/command$/
const TELEMETRY_TOPIC_PATTERN = /^iot\/v1\/device\/([^/]+)\/telemetry$/

export type LastDeviceTelemetryRecord = {
  deviceId: number
  payload: unknown
  receivedAt: string
}

/**
 * Bridges HTTP-facing flows with the MQTT broker: publish commands/status,
 * subscribe to device topics, and dispatch inbound messages to registered listeners.
 */
export class MQTTService {
  private static stateListeners = new Set<MqttMessageListener>()
  private static commandListeners = new Set<MqttMessageListener>()
  private static telemetryListeners = new Set<MqttMessageListener>()
  private static lastStateByDevice = new Map<number, LastDeviceStateRecord>()
  private static lastTelemetryByDevice = new Map<number, LastDeviceTelemetryRecord>()

  private static messageHandlersRegistered = false

  /**
   * Register the global `message` listener on the shared MQTT client (call once at app startup).
   */
  static registerMessageHandlers(): void {
    if (MQTTService.messageHandlersRegistered) {
      logger.warn('[MQTTService] registerMessageHandlers called more than once; skipping')
      return
    }
    MQTTService.messageHandlersRegistered = true
    mqttClient.on('message', (topic: string, payload: Buffer) => {
      try {
        MQTTService.handleIncomingMessage(topic, payload)
      } catch (err) {
        logger.error('[MQTTService] Failed to handle MQTT message', err)
      }
    })
  }

  /**
   * Subscribe to wildcard status and prepare inbound handling. Call after `registerMessageHandlers`.
   */
  static initialize(): void {
    subscribeToAllDeviceStatus()
    subscribeToAllDeviceTelemetry()
  }

  static isConnected(): boolean {
    return mqttClient.connected
  }

  /** HTTP / API → MQTT: send a command to a device. */
  static async sendCommand(deviceId: number, command: string): Promise<void> {
    publishDeviceCommand(deviceId, command)
  }

  /**
   * Publish actuator on/off to `iot/v1/device/{deviceId}/command` as `{ "value": "1" | "0" }`.
   * Uses the numeric DB `deviceId` as the MQTT topic segment (same as REST MQTT API).
   */
  static publishActuatorState(deviceId: number, state: 'on' | 'off'): void {
    const command = state === 'on' ? '1' : '0'
    MQTTService.sendCommand(deviceId, command)
  }

  /** Publish status on behalf of a device (e.g. tests or gateway emulation). */
  static publishState(deviceId: number, state: string): void {
    publishDeviceState(deviceId, state)
    MQTTService.recordDeviceState(deviceId, { state })
  }

  /** Publish telemetry to `iot/v1/device/{deviceId}/telemetry` as `{ "value": string }`. */
  static publishTelemetry(deviceId: number, telemetry: unknown): void {
    publishDeviceTelemetry(deviceId, telemetry)
    MQTTService.recordDeviceTelemetry(deviceId, toMqttValueEnvelope(telemetry))
  }
  /**
   * Last status received from MQTT (`device/{id}/status`) or recorded after API publish.
   */
  static getLastDeviceState(deviceId: number): LastDeviceStateRecord | null {
    return MQTTService.lastStateByDevice.get(deviceId) ?? null
  }

  private static recordDeviceState(deviceId: number, payload: unknown): void {
    MQTTService.lastStateByDevice.set(deviceId, {
      deviceId,
      payload,
      receivedAt: new Date().toISOString()
    })
  }

  private static recordDeviceTelemetry(deviceId: number, payload: unknown): void {
    MQTTService.lastTelemetryByDevice.set(deviceId, {
      deviceId,
      payload,
      receivedAt: new Date().toISOString()
    })
  }

  static subscribeAllDeviceState(): void {
    subscribeToAllDeviceStatus()
  }

  static subscribeDeviceCommand(deviceId: number): void {
    subscribeToDeviceCommand(deviceId)
  }

  static subscribeDeviceTelemetry(deviceId: number): void {
    subscribeToDeviceTelemetry(deviceId)
  }

  /**
   * Subscribe to parsed status payloads for `device/{deviceId}/status`.
   * @returns Unsubscribe function.
   */
  static onDeviceStatus(listener: MqttMessageListener): () => void {
    MQTTService.stateListeners.add(listener)
    return () => {
      MQTTService.stateListeners.delete(listener)
    }
  }

  /**
   * Subscribe to parsed payloads for `device/{deviceId}/command` (inbound on that topic).
   * @returns Unsubscribe function.
   */
  static onDeviceCommand(listener: MqttMessageListener): () => void {
    MQTTService.commandListeners.add(listener)
    return () => {
      MQTTService.commandListeners.delete(listener)
    }
  }

  /**
   * Subscribe to parsed payloads for `device/{deviceId}/telemetry` (inbound on that topic).
   * @returns Unsubscribe function.
   */

  static onDeviceTelemetry(listener: MqttMessageListener): () => void {
    MQTTService.telemetryListeners.add(listener)
    return () => {
      MQTTService.telemetryListeners.delete(listener)
    }
  }

  static handleIncomingMessage(topic: string, payload: Buffer): void {
    const raw = payload.toString()
    logger.info(`MQTT message [${topic}] ${raw}`)

    let parsed: unknown
    try {
      parsed = JSON.parse(raw) as unknown
    } catch {
      parsed = raw
    }

    const statusMatch = topic.match(STATE_TOPIC_PATTERN)
    if (statusMatch) {
      const deviceId = parseInt(statusMatch[1])
      MQTTService.recordDeviceState(deviceId, parsed)
      MQTTService.emitTo(MQTTService.stateListeners, deviceId, parsed)
    }

    const commandMatch = topic.match(COMMAND_TOPIC_PATTERN)
    if (commandMatch) {
      const deviceId = parseInt(commandMatch[1])
      MQTTService.emitTo(MQTTService.commandListeners, deviceId, parsed)
    }

    const telemetryMatch = topic.match(TELEMETRY_TOPIC_PATTERN)
    if (telemetryMatch) {
      const deviceId = parseInt(telemetryMatch[1])
      MQTTService.emitTo(MQTTService.telemetryListeners, deviceId, parsed)
    }
  }

  private static emitTo(
    listeners: Set<MqttMessageListener>,
    deviceId: number,
    payload: unknown
  ): void {
    for (const listener of listeners) {
      try {
        listener(deviceId, payload)
      } catch (err) {
        logger.error('[MQTTService] Listener error', err)
      }
    }
  }
}
