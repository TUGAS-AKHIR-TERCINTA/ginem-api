import { mqttClient } from './client'
import { publishDeviceCommand, publishDeviceStatus } from './publisher'
import { subscribeToAllDeviceStatus, subscribeToDeviceCommand } from './subscriber'
import logger from '../../utilities/logger'

export type MqttMessageListener = (deviceId: string, payload: unknown) => void

/** Last known status for a device (from MQTT or from API publish). */
export type LastDeviceStatusRecord = {
  deviceId: string
  payload: unknown
  receivedAt: string
}

const STATUS_TOPIC_PATTERN = /^device\/([^/]+)\/status$/
const COMMAND_TOPIC_PATTERN = /^device\/([^/]+)\/command$/

/**
 * Bridges HTTP-facing flows with the MQTT broker: publish commands/status,
 * subscribe to device topics, and dispatch inbound messages to registered listeners.
 */
export class MQTTService {
  private static statusListeners = new Set<MqttMessageListener>()
  private static commandListeners = new Set<MqttMessageListener>()
  private static lastStatusByDevice = new Map<string, LastDeviceStatusRecord>()
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
  }

  static isConnected(): boolean {
    return mqttClient.connected
  }

  /** HTTP / API → MQTT: send a command to a device. */
  static sendCommand(deviceId: string, command: string): void {
    publishDeviceCommand(deviceId, command)
  }

  /** Publish status on behalf of a device (e.g. tests or gateway emulation). */
  static publishStatus(deviceId: string, status: string): void {
    publishDeviceStatus(deviceId, status)
    MQTTService.recordDeviceStatus(deviceId, { status })
  }

  /**
   * Last status received from MQTT (`device/{id}/status`) or recorded after API publish.
   */
  static getLastDeviceStatus(deviceId: string): LastDeviceStatusRecord | null {
    return MQTTService.lastStatusByDevice.get(deviceId) ?? null
  }

  private static recordDeviceStatus(deviceId: string, payload: unknown): void {
    MQTTService.lastStatusByDevice.set(deviceId, {
      deviceId,
      payload,
      receivedAt: new Date().toISOString()
    })
  }

  static subscribeAllDeviceStatus(): void {
    subscribeToAllDeviceStatus()
  }

  static subscribeDeviceCommand(deviceId: string): void {
    subscribeToDeviceCommand(deviceId)
  }

  /**
   * Subscribe to parsed status payloads for `device/{deviceId}/status`.
   * @returns Unsubscribe function.
   */
  static onDeviceStatus(listener: MqttMessageListener): () => void {
    MQTTService.statusListeners.add(listener)
    return () => {
      MQTTService.statusListeners.delete(listener)
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

  static handleIncomingMessage(topic: string, payload: Buffer): void {
    const raw = payload.toString()
    logger.info(`MQTT message [${topic}] ${raw}`)

    let parsed: unknown
    try {
      parsed = JSON.parse(raw) as unknown
    } catch {
      parsed = raw
    }

    const statusMatch = topic.match(STATUS_TOPIC_PATTERN)
    if (statusMatch) {
      const deviceId = statusMatch[1]
      MQTTService.recordDeviceStatus(deviceId, parsed)
      MQTTService.emitTo(MQTTService.statusListeners, deviceId, parsed)
    }

    const commandMatch = topic.match(COMMAND_TOPIC_PATTERN)
    if (commandMatch) {
      const deviceId = commandMatch[1]
      MQTTService.emitTo(MQTTService.commandListeners, deviceId, parsed)
    }
  }

  private static emitTo(
    listeners: Set<MqttMessageListener>,
    deviceId: string,
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
