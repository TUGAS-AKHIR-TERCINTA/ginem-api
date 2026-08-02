import type { EvalCategory, LlmCaseResult } from '../schemas/dataset.schema'
import type { ModelConfig } from './paths'

export function calcToolAccuracy(
  correctToolSelections: number,
  totalTests: number
): number {
  if (totalTests === 0) return 0
  return (correctToolSelections / totalTests) * 100
}

export function calcParameterAccuracy(
  correctExpectedParameters: number,
  totalExpectedParameters: number
): number {
  if (totalExpectedParameters === 0) return 100
  return (correctExpectedParameters / totalExpectedParameters) * 100
}

export function calcAverageLatency(totalLatencyMs: number, n: number): number {
  if (n === 0) return 0
  return totalLatencyMs / n
}

export function calcTotalTokens(inputTokens: number, outputTokens: number): number {
  return inputTokens + outputTokens
}

export function calcApiCostUsd(
  inputTokens: number,
  outputTokens: number,
  inputPricePerMillion: number,
  outputPricePerMillion: number
): number {
  return (
    (inputTokens / 1_000_000) * inputPricePerMillion +
    (outputTokens / 1_000_000) * outputPricePerMillion
  )
}

export interface ModelSummary {
  modelId: string
  totalTests: number
  toolAccuracyPct: number
  parameterAccuracyPct: number
  averageLatencyMs: number
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
  estimatedCostUsd: number
  behaviorMatchRatePct: number
  scheduleCases: number
  scheduleToolAccuracyPct: number
  ecaCases: number
  ecaBehaviorMatchPct: number
  ambiguousClarifyRatePct: number
  invalidRejectRatePct: number
  errorCount: number
}

export function summarizeByModel(
  results: LlmCaseResult[],
  models: ModelConfig[]
): ModelSummary[] {
  const byModel = new Map<string, LlmCaseResult[]>()
  for (const r of results) {
    const list = byModel.get(r.modelId) ?? []
    list.push(r)
    byModel.set(r.modelId, list)
  }

  return [...byModel.entries()].map(([modelId, rows]) => {
    const model = models.find((m) => m.id === modelId)
    const totalTests = rows.length
    const toolCorrect = rows.filter((r) => r.toolNameCorrect).length
    const paramCorrect = rows.reduce((s, r) => s + r.parameterCorrectCount, 0)
    const paramTotal = rows.reduce((s, r) => s + r.parameterExpectedCount, 0)
    const latencySum = rows.reduce((s, r) => s + r.latencyMs, 0)
    const inputTokens = rows.reduce((s, r) => s + r.inputTokens, 0)
    const outputTokens = rows.reduce((s, r) => s + r.outputTokens, 0)
    const behaviorMatch = rows.filter((r) => r.behaviorMatch).length

    const scheduleIds = new Set([
      'S08',
      'M02',
      'M03',
      'M04',
      'M05',
      'C01',
      'C04',
      'I02',
      'I03',
      'I04'
    ])
    const scheduleSet = rows.filter((r) => scheduleIds.has(r.caseId))
    const ecaRows = rows.filter((r) => ['C06', 'C07', 'C08', 'I07'].includes(r.caseId))
    const ambiguousRows = rows.filter((r) => r.category === 'ambiguous')
    const invalidRows = rows.filter((r) => r.category === 'invalid')

    return {
      modelId,
      totalTests,
      toolAccuracyPct: calcToolAccuracy(toolCorrect, totalTests),
      parameterAccuracyPct: calcParameterAccuracy(paramCorrect, paramTotal),
      averageLatencyMs: calcAverageLatency(latencySum, totalTests),
      totalInputTokens: inputTokens,
      totalOutputTokens: outputTokens,
      totalTokens: calcTotalTokens(inputTokens, outputTokens),
      estimatedCostUsd: calcApiCostUsd(
        inputTokens,
        outputTokens,
        model?.inputPricePerMillion ?? 0,
        model?.outputPricePerMillion ?? 0
      ),
      behaviorMatchRatePct: totalTests === 0 ? 0 : (behaviorMatch / totalTests) * 100,
      scheduleCases: scheduleSet.length,
      scheduleToolAccuracyPct: calcToolAccuracy(
        scheduleSet.filter((r) => r.toolNameCorrect).length,
        scheduleSet.length
      ),
      ecaCases: ecaRows.length,
      ecaBehaviorMatchPct: calcToolAccuracy(
        ecaRows.filter((r) => r.behaviorMatch).length,
        ecaRows.length
      ),
      ambiguousClarifyRatePct: calcToolAccuracy(
        ambiguousRows.filter((r) => r.behaviorMatch).length,
        ambiguousRows.length
      ),
      invalidRejectRatePct: calcToolAccuracy(
        invalidRows.filter((r) => r.behaviorMatch).length,
        invalidRows.length
      ),
      errorCount: rows.filter((r) => r.error).length
    }
  })
}

export function summarizeByCategory(results: LlmCaseResult[]): Array<{
  category: EvalCategory
  totalTests: number
  toolAccuracyPct: number
  parameterAccuracyPct: number
  averageLatencyMs: number
  behaviorMatchRatePct: number
}> {
  const cats: EvalCategory[] = ['simple', 'medium', 'complex', 'ambiguous', 'invalid']
  return cats.map((category) => {
    const rows = results.filter((r) => r.category === category)
    const totalTests = rows.length
    const toolCorrect = rows.filter((r) => r.toolNameCorrect).length
    const paramCorrect = rows.reduce((s, r) => s + r.parameterCorrectCount, 0)
    const paramTotal = rows.reduce((s, r) => s + r.parameterExpectedCount, 0)
    const latencySum = rows.reduce((s, r) => s + r.latencyMs, 0)
    const behaviorMatch = rows.filter((r) => r.behaviorMatch).length
    return {
      category,
      totalTests,
      toolAccuracyPct: calcToolAccuracy(toolCorrect, totalTests),
      parameterAccuracyPct: calcParameterAccuracy(paramCorrect, paramTotal),
      averageLatencyMs: calcAverageLatency(latencySum, totalTests),
      behaviorMatchRatePct: totalTests === 0 ? 0 : (behaviorMatch / totalTests) * 100
    }
  })
}

export function toCsv(
  rows: Array<Record<string, string | number | boolean | null | undefined>>
): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))
  ]
  return lines.join('\n')
}
