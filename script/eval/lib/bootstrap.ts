import dotenv from 'dotenv'

import { sequelizeInit } from '../../../src/configs/database'
import { MQTTService } from '../../../src/services/mqtt/MQTT.service'
import { mqttClient } from '../../../src/services/mqtt/client'
import { initializeDeviceSchedule } from '../../../src/services/mcp/DeviceSchedule.service'
import logger from '../../../src/utilities/logger'

export interface BootstrapOptions {
  /** Initialize BullMQ device schedule recovery (side-effecting). Default true. */
  initScheduler?: boolean
  /** Max wait for MQTT connect before proceeding. */
  mqttConnectTimeoutMs?: number
}

/**
 * Boot production runtime pieces needed for ChatService E2E eval.
 * Does NOT start Express or RabbitMQ (chat is called directly).
 */
export async function bootstrapEvalRuntime(
  options: BootstrapOptions = {}
): Promise<void> {
  dotenv.config()

  await sequelizeInit.authenticate()
  logger.info('[eval] database authenticated')

  MQTTService.registerMessageHandlers()
  MQTTService.initialize()

  if (options.initScheduler !== false) {
    void initializeDeviceSchedule()
  }

  const timeoutMs = options.mqttConnectTimeoutMs ?? 10000
  await waitForMqttConnected(timeoutMs)
}

export async function waitForMqttConnected(timeoutMs: number): Promise<void> {
  if (MQTTService.isConnected()) return

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error(`MQTT not connected within ${timeoutMs}ms`))
    }, timeoutMs)

    const onConnect = () => {
      cleanup()
      resolve()
    }

    const cleanup = () => {
      clearTimeout(timer)
      mqttClient.off('connect', onConnect)
    }

    mqttClient.on('connect', onConnect)
    if (MQTTService.isConnected()) {
      cleanup()
      resolve()
    }
  })

  logger.info('[eval] MQTT connected')
}

/**
 * Wait until device state is observed (or timeout).
 * Prefer state received after `sinceMs` wall clock.
 */
export async function waitForDeviceStateChange(options: {
  deviceId: number
  timeoutMs: number
  sinceMs: number
}): Promise<{ ok: boolean; payload: unknown | null }> {
  const deadline = Date.now() + options.timeoutMs

  while (Date.now() < deadline) {
    const last = MQTTService.getLastDeviceState(options.deviceId)
    if (last != null) {
      const receivedAt = Date.parse(last.receivedAt)
      if (!Number.isNaN(receivedAt) && receivedAt >= options.sinceMs) {
        return { ok: true, payload: last.payload }
      }
    }
    await new Promise((r) => setTimeout(r, 200))
  }

  const last = MQTTService.getLastDeviceState(options.deviceId)
  return { ok: false, payload: last?.payload ?? null }
}

export async function shutdownEvalRuntime(): Promise<void> {
  try {
    mqttClient.end(true)
  } catch {
    // ignore
  }
  try {
    await sequelizeInit.close()
  } catch {
    // ignore
  }
}
