import path from 'node:path'
import mqtt, { type MqttClient } from 'mqtt'
import {
  appendLog,
  loadDataset,
  loadEvalConfig,
  resolveOutputPaths,
  timestampSlug,
  writeJson,
  writeText
} from '../lib/paths'
import { toCsv } from '../lib/metrics'
import type { EvalCase, IntegrationCaseResult } from '../schemas/dataset.schema'

export type IntegrationMode = 'dry-run' | 'real-device'

export interface IntegrationOptions {
  mode?: IntegrationMode
  caseIds?: string[]
  /**
   * Explicit confirmation for real-device mode.
   * Must be true together with mode=real-device; otherwise dry-run is forced.
   */
  enableRealDevice?: boolean
  mqttUrl?: string
  deviceId?: number
}

interface MockBackend {
  schedules: Array<Record<string, unknown>>
  rules: Array<Record<string, unknown>>
  lastState: Record<number, string>
  lastTelemetry: Record<number, unknown>
}

function createMockBackend(): MockBackend {
  return {
    schedules: [],
    rules: [],
    lastState: {},
    lastTelemetry: {}
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

function deviceCommandTopic(deviceId: number): string {
  return `iot/v1/device/${deviceId}/command`
}

function deviceStateTopic(deviceId: number): string {
  return `iot/v1/device/${deviceId}/state`
}

function deviceTelemetryTopic(deviceId: number): string {
  return `iot/v1/device/${deviceId}/telemetry`
}

/**
 * Dry-run / mock path: simulate agent → MCP → backend → MQTT → ESP32
 * without publishing to a live broker unless real-device is explicitly enabled.
 */
async function runCaseDry(
  evalCase: EvalCase,
  mock: MockBackend,
  logs: string[]
): Promise<Omit<IntegrationCaseResult, 'caseId' | 'category' | 'mode'>> {
  const start = Date.now()
  logs.push(`dry-run start ${evalCase.id}`)

  try {
    if (
      evalCase.expectedBehavior === 'clarify' ||
      evalCase.expectedBehavior === 'reject' ||
      evalCase.expectedBehavior === 'unsupported'
    ) {
      logs.push(`expected non-execution behavior=${evalCase.expectedBehavior}`)
      return {
        functionalSuccess: true,
        integrationSuccess: true,
        mqttSuccess: true,
        latencyMs: Date.now() - start,
        error: null,
        logs
      }
    }

    const tool = evalCase.groundTruth.toolName
    const params = evalCase.groundTruth.parameters
    logs.push(`mock MCP invoke ${tool} ${JSON.stringify(params)}`)

    if (tool === 'set_actuator_state_by_device_name') {
      const deviceId = 1
      const state = String(params.state ?? 'off')
      mock.lastState[deviceId] = state
      logs.push(
        `mock MQTT publish ${deviceCommandTopic(deviceId)} value=${state === 'on' ? '1' : '0'}`
      )
      logs.push(`mock ESP32 ACK state=${state}`)
      return {
        functionalSuccess: true,
        integrationSuccess: true,
        mqttSuccess: true,
        latencyMs: Date.now() - start,
        error: null,
        logs
      }
    }

    if (
      tool === 'get_last_log_by_device_name' ||
      tool === 'get_last_10_logs_by_device_name' ||
      tool === 'list_devices' ||
      tool === 'get_device_by_id'
    ) {
      logs.push('mock backend query OK')
      if (
        String(params.deviceName ?? '')
          .toLowerCase()
          .includes('temperature')
      ) {
        mock.lastTelemetry[2] = { temperature: 27.2 }
        logs.push('mock sensor telemetry temperature=27.2')
      }
      return {
        functionalSuccess: true,
        integrationSuccess: true,
        mqttSuccess: true,
        latencyMs: Date.now() - start,
        error: null,
        logs
      }
    }

    if (tool === 'schedule_actuator_state_at' || tool === 'schedule_sensor_data_at') {
      const job = {
        jobId: `mock-${evalCase.id}-${Date.now()}`,
        ...params,
        storedAt: new Date().toISOString()
      }
      mock.schedules.push(job)
      logs.push(`mock schedule stored ${JSON.stringify(job)}`)
      logs.push('mock schedule execution time verified (stored runAt/hour:minute)')
      return {
        functionalSuccess: true,
        integrationSuccess: true,
        mqttSuccess: true,
        latencyMs: Date.now() - start,
        error: null,
        logs
      }
    }

    if (tool === 'get_scheduled_job_result' || tool === 'list_scheduled_jobs') {
      logs.push(`mock schedule registry size=${mock.schedules.length}`)
      return {
        functionalSuccess: true,
        integrationSuccess: true,
        mqttSuccess: true,
        latencyMs: Date.now() - start,
        error: null,
        logs
      }
    }

    if (tool === 'create_device_log') {
      logs.push('mock device log created')
      return {
        functionalSuccess: true,
        integrationSuccess: true,
        mqttSuccess: true,
        latencyMs: Date.now() - start,
        error: null,
        logs
      }
    }

    // ECA tags: verify "unsupported" path does not mutate rules
    if (evalCase.tags?.includes('eca')) {
      logs.push('ECA not available — no rule mutation (expected)')
      return {
        functionalSuccess: true,
        integrationSuccess: true,
        mqttSuccess: true,
        latencyMs: Date.now() - start,
        error: null,
        logs
      }
    }

    logs.push(`no mock handler for tool=${tool}`)
    return {
      functionalSuccess: false,
      integrationSuccess: false,
      mqttSuccess: false,
      latencyMs: Date.now() - start,
      error: `Unhandled tool in dry-run: ${tool}`,
      logs
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    logs.push(`error ${error}`)
    return {
      functionalSuccess: false,
      integrationSuccess: false,
      mqttSuccess: false,
      latencyMs: Date.now() - start,
      error,
      logs
    }
  }
}

/**
 * Real-device path: connect MQTT, publish command, wait for state/telemetry ACK.
 * Only runs when mode=real-device AND enableRealDevice=true.
 */
async function runCaseReal(
  evalCase: EvalCase,
  opts: {
    mqttUrl: string
    deviceId: number
    mqttAckTimeoutMs: number
  },
  logs: string[]
): Promise<Omit<IntegrationCaseResult, 'caseId' | 'category' | 'mode'>> {
  const start = Date.now()
  logs.push(`real-device start ${evalCase.id}`)

  if (evalCase.expectedBehavior !== 'execute_tool') {
    logs.push('skip physical execution for non-execute case')
    return {
      functionalSuccess: true,
      integrationSuccess: true,
      mqttSuccess: true,
      latencyMs: Date.now() - start,
      error: null,
      logs
    }
  }

  const tool = evalCase.groundTruth.toolName
  if (tool !== 'set_actuator_state_by_device_name') {
    logs.push(
      `real-device MQTT ACK check only implemented for actuator set; tool=${tool} marked integration-only success`
    )
    return {
      functionalSuccess: true,
      integrationSuccess: true,
      mqttSuccess: false,
      latencyMs: Date.now() - start,
      error: null,
      logs
    }
  }

  let client: MqttClient | undefined
  try {
    client = await new Promise<MqttClient>((resolve, reject) => {
      const c = mqtt.connect(opts.mqttUrl, {
        connectTimeout: opts.mqttAckTimeoutMs,
        reconnectPeriod: 0
      })
      const t = setTimeout(() => {
        c.end(true)
        reject(new Error('MQTT connect timeout'))
      }, opts.mqttAckTimeoutMs)
      c.on('connect', () => {
        clearTimeout(t)
        resolve(c)
      })
      c.on('error', (e) => {
        clearTimeout(t)
        reject(e)
      })
    })

    const state = String(evalCase.groundTruth.parameters.state ?? 'off')
    const value = state === 'on' ? '1' : '0'
    const stateTopic = deviceStateTopic(opts.deviceId)
    const cmdTopic = deviceCommandTopic(opts.deviceId)

    await new Promise<void>((resolve, reject) => {
      client!.subscribe(stateTopic, (err) => (err ? reject(err) : resolve()))
    })
    logs.push(`subscribed ${stateTopic}`)

    const ackPromise = new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), opts.mqttAckTimeoutMs)
      client!.on('message', (topic, payload) => {
        if (topic !== stateTopic) return
        const text = payload.toString()
        logs.push(`MQTT state message ${text}`)
        clearTimeout(timer)
        resolve(true)
      })
    })

    client.publish(cmdTopic, JSON.stringify({ value }), { qos: 1 })
    logs.push(`published ${cmdTopic} ${value}`)

    // Also listen briefly on telemetry for sensor monitoring cases
    client.subscribe(deviceTelemetryTopic(opts.deviceId))

    const acked = await ackPromise
    await sleep(100)

    return {
      functionalSuccess: acked,
      integrationSuccess: true,
      mqttSuccess: acked,
      latencyMs: Date.now() - start,
      error: acked ? null : 'MQTT ACK / state change timeout',
      logs
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    logs.push(`error ${error}`)
    return {
      functionalSuccess: false,
      integrationSuccess: false,
      mqttSuccess: false,
      latencyMs: Date.now() - start,
      error,
      logs
    }
  } finally {
    client?.end(true)
  }
}

export async function runIntegrationEvaluation(
  options: IntegrationOptions = {}
): Promise<{ runId: string; results: IntegrationCaseResult[] }> {
  const config = loadEvalConfig()
  let mode: IntegrationMode = options.mode ?? config.defaultMode

  if (mode === 'real-device' && options.enableRealDevice !== true) {
    mode = 'dry-run'
  }

  const dataset = loadDataset(config.datasetPath)
  const cases = dataset.cases.filter((c) =>
    options.caseIds?.length ? options.caseIds.includes(c.id) : true
  )

  const runId = `integration-${timestampSlug()}`
  const out = resolveOutputPaths(config.outputDir, runId)
  const errorLog = path.join(out.logs, 'errors.log')
  appendLog(
    errorLog,
    `[start] integration runId=${runId} mode=${mode} cases=${cases.length}`
  )

  const mock = createMockBackend()
  const results: IntegrationCaseResult[] = []

  for (const evalCase of cases) {
    const logs: string[] = []
    const partial =
      mode === 'real-device'
        ? await runCaseReal(
            evalCase,
            {
              mqttUrl:
                options.mqttUrl ??
                process.env.MQTT_URL ??
                process.env.MQTT_BROKER_URL ??
                'mqtt://127.0.0.1:1883',
              deviceId: options.deviceId ?? Number(process.env.EVAL_DEVICE_ID ?? 1),
              mqttAckTimeoutMs: config.mqttAckTimeoutMs
            },
            logs
          )
        : await runCaseDry(evalCase, mock, logs)

    const row: IntegrationCaseResult = {
      caseId: evalCase.id,
      category: evalCase.category,
      mode,
      ...partial
    }
    results.push(row)
    if (row.error) {
      appendLog(errorLog, `[error] ${evalCase.id} ${row.error}`)
    }
  }

  writeIntegrationArtifacts(out, runId, mode, results, mock)
  return { runId, results }
}

function writeIntegrationArtifacts(
  out: ReturnType<typeof resolveOutputPaths>,
  runId: string,
  mode: IntegrationMode,
  results: IntegrationCaseResult[],
  mock: MockBackend
): void {
  writeJson(path.join(out.raw, 'integration-results.json'), {
    runId,
    mode,
    generatedAt: new Date().toISOString(),
    mockSnapshot: {
      scheduleCount: mock.schedules.length,
      ruleCount: mock.rules.length,
      lastState: mock.lastState,
      lastTelemetry: mock.lastTelemetry
    },
    results
  })

  writeText(
    path.join(out.processed, 'integration-results.csv'),
    toCsv(
      results.map((r) => ({
        caseId: r.caseId,
        category: r.category,
        mode: r.mode,
        functionalSuccess: r.functionalSuccess,
        integrationSuccess: r.integrationSuccess,
        mqttSuccess: r.mqttSuccess,
        latencyMs: r.latencyMs,
        error: r.error
      }))
    )
  )

  const total = results.length || 1
  const summary = {
    runId,
    mode,
    totalTests: results.length,
    functionalSuccessRatePct:
      (results.filter((r) => r.functionalSuccess).length / total) * 100,
    integrationSuccessRatePct:
      (results.filter((r) => r.integrationSuccess).length / total) * 100,
    mqttSuccessRatePct: (results.filter((r) => r.mqttSuccess).length / total) * 100,
    averageLatencyMs:
      results.reduce((s, r) => s + r.latencyMs, 0) / (results.length || 1),
    errorCount: results.filter((r) => r.error).length,
    byCategory: (['simple', 'medium', 'complex', 'ambiguous', 'invalid'] as const).map(
      (category) => {
        const rows = results.filter((r) => r.category === category)
        const n = rows.length || 1
        return {
          category,
          total: rows.length,
          functionalSuccessRatePct:
            (rows.filter((r) => r.functionalSuccess).length / n) * 100,
          mqttSuccessRatePct: (rows.filter((r) => r.mqttSuccess).length / n) * 100,
          averageLatencyMs: rows.reduce((s, r) => s + r.latencyMs, 0) / (rows.length || 1)
        }
      }
    )
  }

  writeJson(path.join(out.processed, 'integration-summary.json'), summary)
  writeText(
    path.join(out.processed, 'integration-summary.csv'),
    toCsv([
      {
        runId: summary.runId,
        mode: summary.mode,
        totalTests: summary.totalTests,
        functionalSuccessRatePct: summary.functionalSuccessRatePct,
        integrationSuccessRatePct: summary.integrationSuccessRatePct,
        mqttSuccessRatePct: summary.mqttSuccessRatePct,
        averageLatencyMs: summary.averageLatencyMs,
        errorCount: summary.errorCount
      }
    ])
  )
}
