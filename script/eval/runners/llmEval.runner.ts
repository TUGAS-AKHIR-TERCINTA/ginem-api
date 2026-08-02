import path from 'node:path'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { createBoundModels } from '../adapters/llm.adapters'
import { createEvalStubTools } from '../adapters/stubTools'
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
  type ModelConfig
} from '../lib/paths'
import { buildUserMessage, extractToolCalls, scoreCase } from '../lib/scoring'
import type { LlmCaseResult } from '../schemas/dataset.schema'

function usageFromResponse(response: unknown): {
  inputTokens: number
  outputTokens: number
} {
  const r = response as {
    usage_metadata?: {
      input_tokens?: number
      output_tokens?: number
    }
    response_metadata?: {
      tokenUsage?: {
        promptTokens?: number
        completionTokens?: number
      }
      usage?: {
        prompt_tokens?: number
        completion_tokens?: number
      }
    }
  }
  const input =
    r.usage_metadata?.input_tokens ??
    r.response_metadata?.tokenUsage?.promptTokens ??
    r.response_metadata?.usage?.prompt_tokens ??
    0
  const output =
    r.usage_metadata?.output_tokens ??
    r.response_metadata?.tokenUsage?.completionTokens ??
    r.response_metadata?.usage?.completion_tokens ??
    0
  return { inputTokens: Number(input) || 0, outputTokens: Number(output) || 0 }
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

export interface LlmEvalOptions {
  modelIds?: string[]
  caseIds?: string[]
  repetitions?: number
}

export async function runLlmEvaluation(
  options: LlmEvalOptions = {}
): Promise<{ runId: string; results: LlmCaseResult[] }> {
  const config = loadEvalConfig()
  const models = loadModelsConfig(config.modelsPath).filter((m) =>
    options.modelIds?.length ? options.modelIds.includes(m.id) : true
  )
  if (models.length === 0) {
    throw new Error('No enabled models selected for LLM evaluation')
  }

  const dataset = loadDataset(config.datasetPath)
  const cases = dataset.cases.filter((c) =>
    options.caseIds?.length ? options.caseIds.includes(c.id) : true
  )
  const repetitions = options.repetitions ?? config.repetitions
  const tools = createEvalStubTools()
  const bound = createBoundModels(models)

  const runId = `llm-${timestampSlug()}`
  const out = resolveOutputPaths(config.outputDir, runId)
  const errorLog = path.join(out.logs, 'errors.log')
  appendLog(
    errorLog,
    `[start] LLM evaluation runId=${runId} models=${models
      .map((m) => m.id)
      .join(',')} cases=${cases.length} reps=${repetitions}`
  )

  const results: LlmCaseResult[] = []

  for (const model of bound) {
    const llmWithTools = model.llm.bindTools(tools)
    for (let rep = 0; rep < repetitions; rep++) {
      for (const evalCase of cases) {
        const requestTs = Date.now()
        let assistantText = ''
        let rawToolCalls: LlmCaseResult['rawToolCalls'] = []
        let inputTokens = 0
        let outputTokens = 0
        let error: string | null = null

        try {
          const response = await withTimeout(
            llmWithTools.invoke([
              new SystemMessage(config.systemPrompt),
              new HumanMessage(buildUserMessage(evalCase))
            ]),
            config.llmTimeoutMs,
            `${model.modelId}:${evalCase.id}`
          )
          const responseTs = Date.now()
          assistantText =
            typeof response.content === 'string'
              ? response.content
              : JSON.stringify(response.content)
          rawToolCalls = extractToolCalls(response)
          const usage = usageFromResponse(response)
          inputTokens = usage.inputTokens
          outputTokens = usage.outputTokens

          const scored = scoreCase(
            evalCase,
            rawToolCalls,
            assistantText,
            config.deviceAliases
          )

          const row: LlmCaseResult = {
            caseId: evalCase.id,
            category: evalCase.category,
            modelId: model.modelId,
            repetition: rep,
            command: evalCase.command,
            rawToolCalls,
            toolCallValid: scored.toolCallValid,
            toolNameCorrect: scored.toolNameCorrect,
            parameterCorrectCount: scored.parameterCorrectCount,
            parameterExpectedCount: scored.parameterExpectedCount,
            expectedBehavior: evalCase.expectedBehavior,
            behaviorMatch: scored.behaviorMatch,
            latencyMs: responseTs - requestTs,
            inputTokens,
            outputTokens,
            totalTokens: calcTotalTokens(inputTokens, outputTokens),
            estimatedCostUsd: calcApiCostUsd(
              inputTokens,
              outputTokens,
              model.config.inputPricePerMillion,
              model.config.outputPricePerMillion
            ),
            error: scored.validationError,
            assistantText
          }
          results.push(row)

          if (scored.validationError) {
            appendLog(
              errorLog,
              `[warn] ${model.modelId} ${evalCase.id} ${scored.validationError}`
            )
          }
        } catch (err) {
          const responseTs = Date.now()
          error = err instanceof Error ? err.message : String(err)
          appendLog(errorLog, `[error] ${model.modelId} ${evalCase.id} ${error}`)
          results.push({
            caseId: evalCase.id,
            category: evalCase.category,
            modelId: model.modelId,
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
            latencyMs: responseTs - requestTs,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            estimatedCostUsd: 0,
            error,
            assistantText
          })
        }
      }
    }
  }

  writeArtifacts(out, runId, results, models, config)
  return { runId, results }
}

function writeArtifacts(
  out: ReturnType<typeof resolveOutputPaths>,
  runId: string,
  results: LlmCaseResult[],
  models: ModelConfig[],
  config: ReturnType<typeof loadEvalConfig>
): void {
  writeJson(path.join(out.raw, 'llm-results.json'), {
    runId,
    generatedAt: new Date().toISOString(),
    config: {
      repetitions: config.repetitions,
      llmTimeoutMs: config.llmTimeoutMs,
      models: models.map((m) => ({
        id: m.id,
        provider: m.provider,
        modelName: m.modelName,
        inputPricePerMillion: m.inputPricePerMillion,
        outputPricePerMillion: m.outputPricePerMillion
      }))
    },
    results
  })

  const csvRows = results.map((r) => ({
    caseId: r.caseId,
    category: r.category,
    modelId: r.modelId,
    repetition: r.repetition,
    toolNameCorrect: r.toolNameCorrect,
    toolCallValid: r.toolCallValid,
    parameterCorrectCount: r.parameterCorrectCount,
    parameterExpectedCount: r.parameterExpectedCount,
    parameterAccuracyPct:
      r.parameterExpectedCount === 0
        ? 100
        : (r.parameterCorrectCount / r.parameterExpectedCount) * 100,
    behaviorMatch: r.behaviorMatch,
    latencyMs: r.latencyMs,
    inputTokens: r.inputTokens,
    outputTokens: r.outputTokens,
    totalTokens: r.totalTokens,
    estimatedCostUsd: r.estimatedCostUsd,
    error: r.error,
    rawToolNames: r.rawToolCalls.map((t) => t.name).join('|')
  }))

  writeText(path.join(out.processed, 'llm-results.csv'), toCsv(csvRows))

  const byModel = summarizeByModel(results, models)
  const byCategory = summarizeByCategory(results)

  writeJson(path.join(out.processed, 'summary-by-model.json'), byModel)
  writeJson(path.join(out.processed, 'summary-by-category.json'), byCategory)
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

  writeJson(path.join(out.processed, 'summary.json'), {
    runId,
    scoringRules: {
      toolAccuracy: 'correct tool selections / total tests × 100%',
      parameterAccuracy: 'correct expected parameters / total expected parameters × 100%',
      llmLatency: 'response timestamp − request timestamp',
      averageLatency: 'total latency / number of tests',
      totalTokens: 'input tokens + output tokens',
      apiCost: 'inputTokens/1e6×inputPrice + outputTokens/1e6×outputPrice'
    },
    byModel,
    byCategory
  })
}
