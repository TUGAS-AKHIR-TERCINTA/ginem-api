import path from 'node:path'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'

import { ChatService } from '../../../src/services/chat'
import { LLMService, type LLMProvider } from '../../../src/services/llm'
import { DeviceService } from '../../../src/services/device'
import { MQTTService } from '../../../src/services/mqtt/MQTT.service'
import {
  bootstrapEvalRuntime,
  shutdownEvalRuntime,
  waitForDeviceStateChange
} from '../lib/bootstrap'
import {
  calcApiCostUsd,
  calcTotalTokens,
  summarizeByCategory,
  summarizeByModel,
  toCsv
} from '../lib/metrics'
import {
  appendLog,
  loadDataset,
  loadEvalConfig,
  loadModelsConfig,
  resolveOutputPaths,
  timestampSlug,
  writeJson,
  writeText,
  type ModelConfig,
  type EvalRuntimeConfig
} from '../lib/paths'
import { scoreCase } from '../lib/scoring'
import type { EvalCase, LlmCaseResult, ToolCall } from '../schemas/dataset.schema'

export interface E2EEvalOptions {
  modelIds?: string[]
  caseIds?: string[]
  repetitions?: number
  /**
   * Must be true to run. Physical MQTT / device tools will execute.
   */
  enableRealDevice: boolean
  skipBootstrap?: boolean
}

export interface E2ECaseResult extends LlmCaseResult {
  mqttSuccess: boolean
  integrationSuccess: boolean
  functionalSuccess: boolean
  mqttPayload: unknown | null
  brokerConnected: boolean
  logs: string[]
}

function toProvider(provider: string): LLMProvider {
  if (provider === 'deepseek') return 'deepseek'
  return 'openai'
}

function createModelFromConfig(config: ModelConfig): BaseChatModel {
  return LLMService.create({
    provider: toProvider(config.provider),
    model: config.modelName,
    temperature: config.temperature,
    maxTokens: config.maxTokens
  })
}

function buildUserMessage(evalCase: EvalCase): string {
  const parts: string[] = []
  if (evalCase.conversationContext?.length) {
    parts.push(`[Conversation Context]\n${evalCase.conversationContext.join('\n')}`)
  }
  // Dataset ragContext is optional hint; live Pinecone still runs inside ChatService.
  if (evalCase.ragContext) {
    parts.push(`[Dataset RAG hint]\n${evalCase.ragContext}`)
  }
  parts.push(evalCase.command)
  return parts.length === 1 ? evalCase.command : parts.join('\n\n')
}

async function resolveActuatorDeviceId(toolCalls: ToolCall[]): Promise<number | null> {
  const actuatorCall = toolCalls.find(
    (t) => t.name === 'set_actuator_state_by_device_name'
  )
  if (!actuatorCall) return null
  const name = actuatorCall.args.deviceName
  if (typeof name !== 'string' || name.trim() === '') return null
  try {
    const device = await DeviceService.findByName(name)
    return device?.deviceId ?? null
  } catch {
    return null
  }
}

async function verifyMqttAfterTools(options: {
  evalCase: EvalCase
  toolCalls: ToolCall[]
  sinceMs: number
  mqttAckTimeoutMs: number
  logs: string[]
}): Promise<{ mqttSuccess: boolean; mqttPayload: unknown | null }> {
  const { evalCase, toolCalls, sinceMs, mqttAckTimeoutMs, logs } = options

  if (evalCase.expectedBehavior !== 'execute_tool') {
    logs.push('skip MQTT ACK (non-execute behavior)')
    return { mqttSuccess: true, mqttPayload: null }
  }

  const hasActuator = toolCalls.some(
    (t) => t.name === 'set_actuator_state_by_device_name'
  )
  if (!hasActuator) {
    logs.push('no actuator tool call — MQTT ACK not required')
    return { mqttSuccess: true, mqttPayload: null }
  }

  if (!MQTTService.isConnected()) {
    logs.push('MQTT broker not connected')
    return { mqttSuccess: false, mqttPayload: null }
  }

  const deviceId = await resolveActuatorDeviceId(toolCalls)
  if (deviceId == null) {
    logs.push('could not resolve deviceId for MQTT ACK')
    return { mqttSuccess: false, mqttPayload: null }
  }

  logs.push(`waiting MQTT state for deviceId=${deviceId}`)
  const ack = await waitForDeviceStateChange({
    deviceId,
    timeoutMs: mqttAckTimeoutMs,
    sinceMs
  })
  logs.push(
    ack.ok
      ? `MQTT state observed: ${JSON.stringify(ack.payload)}`
      : 'MQTT state ACK timeout'
  )
  return { mqttSuccess: ack.ok, mqttPayload: ack.payload }
}

/**
 * End-to-end evaluation through ChatService (no RabbitMQ):
 * chat input → RAG + memory + agent + real device tools → MQTT → optional ESP32 ACK.
 */
export async function runE2EChatEvaluation(
  options: E2EEvalOptions
): Promise<{ runId: string; results: E2ECaseResult[] }> {
  if (options.enableRealDevice !== true) {
    throw new Error(
      'Refusing to run E2E device evaluation without enableRealDevice=true. ' +
        'This path executes real MCP tools and may publish MQTT commands.'
    )
  }

  const config = loadEvalConfig()
  const models = loadModelsConfig(config.modelsPath).filter((m) =>
    options.modelIds?.length ? options.modelIds.includes(m.id) : true
  )
  if (models.length === 0) {
    throw new Error('No enabled models selected for E2E evaluation')
  }

  const dataset = loadDataset(config.datasetPath)
  const cases = dataset.cases.filter((c) =>
    options.caseIds?.length ? options.caseIds.includes(c.id) : true
  )
  const repetitions = options.repetitions ?? config.repetitions

  const runId = `e2e-${timestampSlug()}`
  const out = resolveOutputPaths(config.outputDir, runId)
  const errorLog = path.join(out.logs, 'errors.log')

  if (!options.skipBootstrap) {
    await bootstrapEvalRuntime({
      mqttConnectTimeoutMs: config.integrationTimeoutMs
    })
  }

  appendLog(
    errorLog,
    `[start] E2E ChatService runId=${runId} models=${models
      .map((m) => m.id)
      .join(',')} cases=${cases.length} mqttConnected=${MQTTService.isConnected()}`
  )

  const results: E2ECaseResult[] = []

  try {
    for (const modelConfig of models) {
      const model = createModelFromConfig(modelConfig)

      for (let rep = 0; rep < repetitions; rep++) {
        for (const evalCase of cases) {
          const row = await runOneCase({
            evalCase,
            model,
            modelConfig,
            rep,
            config,
            runId,
            errorLog
          })
          results.push(row)
        }
      }
    }
  } finally {
    if (!options.skipBootstrap) {
      await shutdownEvalRuntime()
    }
  }

  writeE2EArtifacts(out, runId, results, models, config)
  return { runId, results }
}

async function runOneCase(args: {
  evalCase: EvalCase
  model: BaseChatModel
  modelConfig: ModelConfig
  rep: number
  config: EvalRuntimeConfig
  runId: string
  errorLog: string
}): Promise<E2ECaseResult> {
  const { evalCase, model, modelConfig, rep, config, runId, errorLog } = args
  const logs: string[] = []
  const requestTs = Date.now()
  const sessionId = `eval:${runId}:${modelConfig.id}:${evalCase.id}:r${rep}`
  const userMessage = buildUserMessage(evalCase)

  let rawToolCalls: ToolCall[] = []
  let assistantText = ''
  let error: string | null = null
  let agentLatencyMs = 0

  try {
    logs.push(`ChatService.query model=${modelConfig.id}`)
    const sinceMs = Date.now()
    const response = await withTimeout(
      ChatService.query(userMessage, {
        model,
        captureTrace: true,
        withAudio: false,
        userId: config.evalUserId ?? 1,
        sessionId,
        source: 'web'
      }),
      config.llmTimeoutMs,
      `${modelConfig.id}:${evalCase.id}`
    )

    assistantText = response.reply
    rawToolCalls = (response.trace?.toolCalls ?? []).map((t) => ({
      name: t.name,
      args: t.args,
      id: t.id
    }))
    agentLatencyMs = response.trace?.agentLatencyMs ?? Date.now() - requestTs
    logs.push(`reply=${assistantText.slice(0, 160)}`)
    logs.push(`toolCalls=${rawToolCalls.map((t) => t.name).join('|') || '(none)'}`)

    const scored = scoreCase(evalCase, rawToolCalls, assistantText, config.deviceAliases)

    const mqtt = await verifyMqttAfterTools({
      evalCase,
      toolCalls: rawToolCalls,
      sinceMs,
      mqttAckTimeoutMs: config.mqttAckTimeoutMs,
      logs
    })

    const functionalSuccess =
      scored.behaviorMatch &&
      (evalCase.expectedBehavior !== 'execute_tool' || scored.toolNameCorrect)
    const integrationSuccess = error == null
    const latencyMs = Date.now() - requestTs

    if (scored.validationError) {
      appendLog(
        errorLog,
        `[warn] ${modelConfig.id} ${evalCase.id} ${scored.validationError}`
      )
    }

    return {
      caseId: evalCase.id,
      category: evalCase.category,
      modelId: modelConfig.id,
      repetition: rep,
      command: evalCase.command,
      rawToolCalls,
      toolCallValid: scored.toolCallValid,
      toolNameCorrect: scored.toolNameCorrect,
      parameterCorrectCount: scored.parameterCorrectCount,
      parameterExpectedCount: scored.parameterExpectedCount,
      expectedBehavior: evalCase.expectedBehavior,
      behaviorMatch: scored.behaviorMatch,
      latencyMs,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      error: scored.validationError,
      assistantText,
      mqttSuccess: mqtt.mqttSuccess,
      integrationSuccess,
      functionalSuccess,
      mqttPayload: mqtt.mqttPayload,
      brokerConnected: MQTTService.isConnected(),
      logs
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
    appendLog(errorLog, `[error] ${modelConfig.id} ${evalCase.id} ${error}`)
    logs.push(`error ${error}`)
    return {
      caseId: evalCase.id,
      category: evalCase.category,
      modelId: modelConfig.id,
      repetition: rep,
      command: evalCase.command,
      rawToolCalls,
      toolCallValid: false,
      toolNameCorrect: false,
      parameterCorrectCount: 0,
      parameterExpectedCount:
        evalCase.groundTruth.requiredParameterKeys.length ||
        Object.keys(evalCase.groundTruth.parameters).length,
      expectedBehavior: evalCase.expectedBehavior,
      behaviorMatch: false,
      latencyMs: Date.now() - requestTs,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: calcTotalTokens(0, 0),
      estimatedCostUsd: calcApiCostUsd(
        0,
        0,
        modelConfig.inputPricePerMillion,
        modelConfig.outputPricePerMillion
      ),
      error,
      assistantText,
      mqttSuccess: false,
      integrationSuccess: false,
      functionalSuccess: false,
      mqttPayload: null,
      brokerConnected: MQTTService.isConnected(),
      logs
    }
  } finally {
    void agentLatencyMs
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms)
      })
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function writeE2EArtifacts(
  out: ReturnType<typeof resolveOutputPaths>,
  runId: string,
  results: E2ECaseResult[],
  models: ModelConfig[],
  config: EvalRuntimeConfig
): void {
  writeJson(path.join(out.raw, 'e2e-results.json'), {
    runId,
    mode: 'real-device',
    path: 'ChatService.query (no RabbitMQ)',
    generatedAt: new Date().toISOString(),
    results
  })

  writeText(
    path.join(out.processed, 'e2e-results.csv'),
    toCsv(
      results.map((r) => ({
        caseId: r.caseId,
        category: r.category,
        modelId: r.modelId,
        repetition: r.repetition,
        toolNameCorrect: r.toolNameCorrect,
        behaviorMatch: r.behaviorMatch,
        functionalSuccess: r.functionalSuccess,
        integrationSuccess: r.integrationSuccess,
        mqttSuccess: r.mqttSuccess,
        brokerConnected: r.brokerConnected,
        latencyMs: r.latencyMs,
        error: r.error,
        rawToolNames: r.rawToolCalls.map((t) => t.name).join('|'),
        replyPreview: (r.assistantText ?? '').slice(0, 120)
      }))
    )
  )

  const asLlm: LlmCaseResult[] = results
  const byModel = summarizeByModel(asLlm, models)
  const byCategory = summarizeByCategory(asLlm)

  const total = results.length || 1
  const systemSummary = {
    runId,
    totalTests: results.length,
    functionalSuccessRatePct:
      (results.filter((r) => r.functionalSuccess).length / total) * 100,
    integrationSuccessRatePct:
      (results.filter((r) => r.integrationSuccess).length / total) * 100,
    mqttSuccessRatePct: (results.filter((r) => r.mqttSuccess).length / total) * 100,
    averageLatencyMs:
      results.reduce((s, r) => s + r.latencyMs, 0) / (results.length || 1),
    errorCount: results.filter((r) => r.error).length,
    note: 'Token/cost fields are 0 in E2E unless provider usage is exposed by createAgent; use isolated LLM runner for token accounting if needed.'
  }

  writeJson(path.join(out.processed, 'summary-by-model.json'), byModel)
  writeJson(path.join(out.processed, 'summary-by-category.json'), byCategory)
  writeJson(path.join(out.processed, 'system-integration-summary.json'), systemSummary)
  writeJson(path.join(out.processed, 'summary.json'), {
    runId,
    config: {
      repetitions: config.repetitions,
      mqttAckTimeoutMs: config.mqttAckTimeoutMs,
      models: models.map((m) => m.id)
    },
    byModel,
    byCategory,
    systemSummary
  })
  writeText(
    path.join(out.processed, 'summary-by-model.csv'),
    toCsv(
      byModel.map((s) => ({
        ...s,
        estimatedCostUsd: Number(s.estimatedCostUsd.toFixed(6))
      }))
    )
  )
  writeText(path.join(out.processed, 'summary-by-category.csv'), toCsv(byCategory))
  writeText(
    path.join(out.processed, 'system-integration-summary.csv'),
    toCsv([systemSummary])
  )
}
