import axios, { type AxiosInstance } from 'axios'
import type { FunctionalTestCase } from '../datasets/functionalDataset.schema'
import type { FunctionalEvaluationRecord } from './functionalTypes'
import { appendFunctionalResult } from '../writers/resultWriter'
import { redactSecrets } from '../writers/redact'

export interface FunctionalRunOptions {
  runId: string
  runDir: string
  baseUrl: string
  email: string
  password: string
  testCases: FunctionalTestCase[]
  ackTimeoutMs: number
  ackPollIntervalMs: number
  /**
   * How old a device_logs row may be (from "now") to still count as proof that
   * MQTT telemetry is flowing, for kind='sensor_read'. A chat request never makes
   * the ESP32 push fresh telemetry on demand — it only reads whatever the device
   * last pushed on its own schedule — so "success" here means "the pipeline is
   * demonstrably alive recently," not "this specific request triggered new data."
   */
  sensorFreshnessMs: number
  onRecord?: (record: FunctionalEvaluationRecord) => void
}

interface DeviceLookup {
  deviceId: number
  deviceName: string
}

async function login(
  client: AxiosInstance,
  email: string,
  password: string
): Promise<string> {
  const res = await client.post('/api/v1/auth/login', {
    userEmail: email,
    userPassword: password
  })
  const token = res.data?.data?.accessToken
  if (typeof token !== 'string' || token === '') {
    throw new Error(
      'Login succeeded but no accessToken was returned — check EVAL_API_EMAIL/EVAL_API_PASSWORD.'
    )
  }
  return token
}

async function findDeviceByName(
  client: AxiosInstance,
  deviceName: string
): Promise<DeviceLookup | null> {
  const res = await client.get('/api/v1/devices', {
    params: { page: 1, size: 100, pagination: true }
  })
  const items: Array<{ deviceId: number; deviceName: string }> =
    res.data?.data?.items ?? []
  const found = items.find((d) => d.deviceName === deviceName)
  return found == null ? null : { deviceId: found.deviceId, deviceName: found.deviceName }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Poll GET /api/v1/mqtt/devices/:id/status until it reports a state update whose
 * receivedAt is after `since`, or ackTimeoutMs elapses. This is an APPROXIMATION of
 * a real ACK — the production MQTT layer has no command-id/ack correlation (see
 * evaluation/README.md "Ketidaksesuaian #2") — a state change within the timeout
 * window is treated as evidence the command was applied.
 */
async function pollForAck(
  client: AxiosInstance,
  deviceId: number,
  since: Date,
  timeoutMs: number,
  pollIntervalMs: number
): Promise<{ ackAt: string | null; status: unknown }> {
  const deadline = Date.now() + timeoutMs
  let lastStatus: unknown = null

  while (Date.now() < deadline) {
    const res = await client.get(`/api/v1/mqtt/devices/${deviceId}/status`)
    const status = res.data?.data as { receivedAt?: string; payload?: unknown } | null
    lastStatus = status
    if (status?.receivedAt != null && new Date(status.receivedAt) >= since) {
      return { ackAt: status.receivedAt, status }
    }
    await sleep(pollIntervalMs)
  }

  return { ackAt: null, status: lastStatus }
}

interface DeviceLogRow {
  deviceLogId: number
  deviceLogData: string
  createdAt: string
}

/**
 * Poin 34 ("Keberhasilan pengujian ditentukan berdasarkan ... data sensor yang
 * sesuai"): checks that the latest device_logs row for this sensor (populated
 * by TelemetryService from real MQTT telemetry — see evaluation/README.md) is
 * newer than `now - freshnessMs`, rather than trusting an HTTP 200 alone as
 * proof the MQTT pipeline is actually delivering data.
 */
async function checkSensorFreshness(
  client: AxiosInstance,
  deviceId: number,
  freshnessMs: number
): Promise<{ fresh: boolean; log: DeviceLogRow | null }> {
  try {
    const res = await client.get(`/api/v1/devices/logs/last/${deviceId}`)
    const log = res.data?.data as DeviceLogRow | null
    if (log?.createdAt == null) return { fresh: false, log: null }
    const ageMs = Date.now() - new Date(log.createdAt).getTime()
    return { fresh: ageMs >= 0 && ageMs <= freshnessMs, log }
  } catch {
    return { fresh: false, log: null }
  }
}

export async function runFunctionalEvaluation(
  options: FunctionalRunOptions
): Promise<void> {
  const client = axios.create({ baseURL: options.baseUrl, timeout: 30_000 })
  const token = await login(client, options.email, options.password)
  client.defaults.headers.common.Authorization = `Bearer ${token}`

  const deviceCache = new Map<string, DeviceLookup | null>()

  for (const testCase of options.testCases) {
    const record = await runSingleFunctionalCase(client, testCase, options, deviceCache)
    appendFunctionalResult(options.runDir, record)
    options.onRecord?.(record)
  }
}

async function runSingleFunctionalCase(
  client: AxiosInstance,
  testCase: FunctionalTestCase,
  options: FunctionalRunOptions,
  deviceCache: Map<string, DeviceLookup | null>
): Promise<FunctionalEvaluationRecord> {
  const timestamp = new Date().toISOString()
  const requestStartedAt = new Date()

  let device: DeviceLookup | null = null
  if (testCase.deviceName != null) {
    if (!deviceCache.has(testCase.deviceName)) {
      deviceCache.set(
        testCase.deviceName,
        await findDeviceByName(client, testCase.deviceName)
      )
    }
    device = deviceCache.get(testCase.deviceName) ?? null
  }

  try {
    const res = await client.post('/api/v1/chat', { message: testCase.input })
    const responseCompletedAt = new Date()
    const reply = redactSecrets(String(res.data?.data?.reply ?? ''))

    let mqttAckAt: string | null = null
    let ackReceived = false
    let finalDeviceStatus: unknown = null
    let endToEndLatencyMs: number | null = null

    let sensorFresh = false

    if (testCase.kind === 'device_control' && device != null) {
      const ack = await pollForAck(
        client,
        device.deviceId,
        requestStartedAt,
        options.ackTimeoutMs,
        options.ackPollIntervalMs
      )
      mqttAckAt = ack.ackAt
      finalDeviceStatus = ack.status
      ackReceived = ack.ackAt != null
      endToEndLatencyMs = ackReceived
        ? new Date(ack.ackAt as string).getTime() - requestStartedAt.getTime()
        : null
    } else if (testCase.kind === 'sensor_read' && device != null) {
      const freshness = await checkSensorFreshness(
        client,
        device.deviceId,
        options.sensorFreshnessMs
      )
      sensorFresh = freshness.fresh
      ackReceived = freshness.fresh
      finalDeviceStatus = freshness.log
      endToEndLatencyMs = sensorFresh
        ? responseCompletedAt.getTime() - requestStartedAt.getTime()
        : null
    }

    // axios rejects on non-2xx by default, so reaching this point already means the
    // HTTP call succeeded. device_control additionally requires a real ACK;
    // sensor_read additionally requires a recent (fresh) telemetry row.
    const integrationSuccess =
      testCase.kind === 'device_control'
        ? ackReceived
        : testCase.kind === 'sensor_read'
          ? sensorFresh
          : true

    return {
      runId: options.runId,
      testCaseId: testCase.id,
      kind: testCase.kind,
      inputText: testCase.input,
      requestStartedAt: requestStartedAt.toISOString(),
      responseCompletedAt: responseCompletedAt.toISOString(),
      apiRoundTripMs: responseCompletedAt.getTime() - requestStartedAt.getTime(),
      reply,
      deviceId: device?.deviceId ?? null,
      deviceName: device?.deviceName ?? testCase.deviceName ?? null,
      expectedFinalState: testCase.expectedFinalState ?? null,
      mqttAckAt,
      ackReceived,
      finalDeviceStatus,
      endToEndLatencyMs,
      integrationSuccess,
      // Mirrors integrationSuccess today: device_control/sensor_read are exactly the
      // two kinds where "success" IS defined by MQTT-layer evidence (ACK / fresh
      // telemetry); the other kinds don't exercise MQTT at all in this test.
      mqttSuccess: integrationSuccess,
      errorMessage: null,
      timestamp
    }
  } catch (err) {
    const responseCompletedAt = new Date()
    const message = redactSecrets(err instanceof Error ? err.message : String(err))
    return {
      runId: options.runId,
      testCaseId: testCase.id,
      kind: testCase.kind,
      inputText: testCase.input,
      requestStartedAt: requestStartedAt.toISOString(),
      responseCompletedAt: responseCompletedAt.toISOString(),
      apiRoundTripMs: responseCompletedAt.getTime() - requestStartedAt.getTime(),
      reply: null,
      deviceId: device?.deviceId ?? null,
      deviceName: device?.deviceName ?? testCase.deviceName ?? null,
      expectedFinalState: testCase.expectedFinalState ?? null,
      mqttAckAt: null,
      ackReceived: false,
      finalDeviceStatus: null,
      endToEndLatencyMs: null,
      integrationSuccess: false,
      mqttSuccess: false,
      errorMessage: message,
      timestamp
    }
  }
}
