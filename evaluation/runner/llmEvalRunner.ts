import { ChatService } from '../../src/services/chat/Chat.service'
import { enableDryRun, disableDryRun, resetDryRunSideEffects } from '../agent/dryRunGuard'
import { buildEvalModel } from '../agent/modelAdapter'
import type { EvalModelConfig } from '../config/models.config'
import type { DatasetCase } from '../datasets/dataset.schema'
import { compareTools } from '../metrics/toolComparator'
import { compareParameters } from '../metrics/parameterComparator'
import { compareSchedule } from '../metrics/scheduleComparator'
import { compareRule } from '../metrics/ruleComparator'
import { validateStructure } from '../metrics/structureValidator'
import { classifyErrors } from '../metrics/errorClassifier'
import {
  totalTokens,
  estimateCostBreakdownUsd,
  getModelRate
} from '../metrics/costCalculator'
import { withRetry, RetryExhaustedError } from './retry'
import { runWithConcurrency } from './concurrency'
import { loadCompletedKeys, makeRecordKey } from './resume'
import { appendRawResult } from '../writers/resultWriter'
import { redactSecrets } from '../writers/redact'
import type { RawEvaluationRecord } from './types'

const CLARIFICATION_MARKERS = [
  '?',
  'yang mana',
  'maksud anda',
  'maksud kamu',
  'bisa dijelaskan',
  'perangkat apa',
  'perangkat mana',
  'tolong sebutkan',
  'mohon konfirmasi',
  'device mana',
  'lampu yang mana',
  'yang dimaksud'
]

/**
 * Heuristic only (documented in evaluation/README.md limitations) — there is no
 * structured "behavior" field in ChatService's response, so a no-tool-call reply
 * is inferred to be a clarifying question if it reads like one. clarificationCorrect
 * / invalidCommandHandledCorrect below do NOT depend on this heuristic; both only
 * require "no tool call happened," which is measured directly from the trace.
 */
function looksLikeClarifyingQuestion(replyText: string): boolean {
  const lower = replyText.toLowerCase()
  return CLARIFICATION_MARKERS.some((marker) => lower.includes(marker))
}

export interface RunLlmEvalOptions {
  runId: string
  runDir: string
  datasetCases: DatasetCase[]
  models: EvalModelConfig[]
  repetitions: number
  concurrency: number
  maxRetries: number
  retryBaseDelayMs: number
  onRecord?: (record: RawEvaluationRecord) => void
}

interface Task {
  model: EvalModelConfig
  testCase: DatasetCase
  repetition: number
}

export async function runLlmEvaluation(options: RunLlmEvalOptions): Promise<void> {
  enableDryRun()
  try {
    const completed = loadCompletedKeys(options.runDir)
    const tasks: Task[] = []

    for (const model of options.models) {
      for (const testCase of options.datasetCases) {
        for (let repetition = 1; repetition <= options.repetitions; repetition += 1) {
          if (completed.has(makeRecordKey(testCase.id, model.key, repetition))) continue
          tasks.push({ model, testCase, repetition })
        }
      }
    }

    await runWithConcurrency(tasks, options.concurrency, async (task) => {
      const record = await runSingleCase(task, options)
      appendRawResult(options.runDir, record)
      options.onRecord?.(record)
    })
  } finally {
    disableDryRun()
  }
}

async function runSingleCase(
  task: Task,
  options: RunLlmEvalOptions
): Promise<RawEvaluationRecord> {
  const { model, testCase, repetition } = task
  const timestamp = new Date().toISOString()
  resetDryRunSideEffects()

  try {
    const { value, attempts } = await withRetry(
      async () => {
        const chatModel = buildEvalModel(model)
        const startedAt = process.hrtime.bigint()
        // No userId/sessionId => resolveMemoryScope() returns null => a clean,
        // history-free turn every time (poin 21 state isolation).
        const response = await ChatService.query(testCase.input, {
          model: chatModel,
          captureTrace: true
        })
        const apiLatencyMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
        return { response, apiLatencyMs }
      },
      { maxRetries: options.maxRetries, baseDelayMs: options.retryBaseDelayMs }
    )

    return buildSuccessRecord(
      options.runId,
      model,
      testCase,
      repetition,
      timestamp,
      value,
      attempts
    )
  } catch (err) {
    return buildErrorRecord(options.runId, model, testCase, repetition, timestamp, err)
  }
}

function buildSuccessRecord(
  runId: string,
  model: EvalModelConfig,
  testCase: DatasetCase,
  repetition: number,
  timestamp: string,
  outcome: {
    response: Awaited<ReturnType<typeof ChatService.query>>
    apiLatencyMs: number
  },
  attempts: number
): RawEvaluationRecord {
  const { response, apiLatencyMs } = outcome
  const toolCalls = response.trace?.toolCalls ?? []
  const replyText = response.reply

  const toolComparison = compareTools(testCase.expected, toolCalls)
  const hasMatchedPairs = toolComparison.matchedPairs.length > 0
  const parameterComparison = hasMatchedPairs
    ? compareParameters(toolComparison.matchedPairs)
    : null

  const structureResults = toolCalls.map((call) =>
    validateStructure(call.name, call.args)
  )
  const structureValid =
    toolCalls.length === 0 ? null : structureResults.every((r) => r.structureValid)

  const hasScheduleGroundTruth = (testCase.expected.schedule?.length ?? 0) > 0
  const scheduleComparison = hasScheduleGroundTruth
    ? compareSchedule(testCase.expected.schedule, toolCalls)
    : null

  const hasRuleGroundTruth = (testCase.expected.rule?.length ?? 0) > 0
  const ruleComparison = hasRuleGroundTruth
    ? compareRule(testCase.expected.rule, toolCalls)
    : null

  const calledAnyTool = toolCalls.length > 0
  const actualBehavior: RawEvaluationRecord['actualBehavior'] = calledAnyTool
    ? 'tool_call'
    : 'no_tool_call'
  const clarificationRequested = !calledAnyTool && looksLikeClarifyingQuestion(replyText)

  const errorTypes = classifyErrors({
    expectedBehavior: testCase.expected.behavior,
    toolComparison,
    parameterCorrect: parameterComparison?.parameterCorrect,
    structureValid: structureValid ?? undefined
  })

  const tokenUsage = response.trace?.tokenUsage
  const cost =
    tokenUsage != null
      ? estimateCostBreakdownUsd(tokenUsage, getModelRate(model.key))
      : null

  return {
    runId,
    testCaseId: testCase.id,
    category: testCase.category,
    model: model.displayName,
    modelKey: model.key,
    provider: model.provider,
    repetition,
    inputText: testCase.input,
    expectedBehavior: testCase.expected.behavior,
    actualBehavior,
    expectedToolCalls: testCase.expected.toolCalls ?? [],
    actualToolCalls: toolCalls,
    toolCorrect: toolComparison.toolCorrect,
    parameterCorrect: parameterComparison?.parameterCorrect ?? null,
    parametersCheckedCount: parameterComparison?.parametersChecked ?? null,
    parametersCorrectCount: parameterComparison?.parametersCorrect ?? null,
    structureValid,
    scheduleCorrect: scheduleComparison?.scheduleCorrect ?? null,
    dynamicRuleCorrect: ruleComparison?.ruleCorrect ?? null,
    clarificationRequested,
    clarificationCorrect:
      testCase.category === 'ambiguous'
        ? testCase.expected.behavior === 'clarification' && !calledAnyTool
        : null,
    invalidCommandHandledCorrect:
      testCase.category === 'invalid'
        ? testCase.expected.behavior === 'reject_or_no_tool' && !calledAnyTool
        : null,
    errorTypes,
    apiLatencyMs,
    inputTokens: tokenUsage?.inputTokens ?? null,
    outputTokens: tokenUsage?.outputTokens ?? null,
    totalTokens: tokenUsage != null ? totalTokens(tokenUsage) : null,
    inputCostUsd: cost?.inputCostUsd ?? null,
    outputCostUsd: cost?.outputCostUsd ?? null,
    totalCostUsd: cost?.totalCostUsd ?? null,
    attempt: attempts,
    errorType: null,
    errorMessage: null,
    rawModelReply: redactSecrets(replyText),
    timestamp
  }
}

function buildErrorRecord(
  runId: string,
  model: EvalModelConfig,
  testCase: DatasetCase,
  repetition: number,
  timestamp: string,
  err: unknown
): RawEvaluationRecord {
  const attempts = err instanceof RetryExhaustedError ? err.attempts : 1
  const cause = err instanceof RetryExhaustedError ? err.cause : err
  const message = redactSecrets(cause instanceof Error ? cause.message : String(cause))

  return {
    runId,
    testCaseId: testCase.id,
    category: testCase.category,
    model: model.displayName,
    modelKey: model.key,
    provider: model.provider,
    repetition,
    inputText: testCase.input,
    expectedBehavior: testCase.expected.behavior,
    actualBehavior: 'no_tool_call',
    expectedToolCalls: testCase.expected.toolCalls ?? [],
    actualToolCalls: [],
    toolCorrect: false,
    parameterCorrect: null,
    parametersCheckedCount: null,
    parametersCorrectCount: null,
    structureValid: null,
    scheduleCorrect: null,
    dynamicRuleCorrect: null,
    clarificationRequested: false,
    clarificationCorrect: null,
    invalidCommandHandledCorrect: null,
    errorTypes: ['OTHER'],
    apiLatencyMs: null,
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    inputCostUsd: null,
    outputCostUsd: null,
    totalCostUsd: null,
    attempt: attempts,
    errorType: 'API_ERROR',
    errorMessage: message,
    rawModelReply: null,
    timestamp
  }
}
