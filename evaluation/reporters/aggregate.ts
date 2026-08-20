import type { RawEvaluationRecord } from '../runner/types'
import type { DatasetCategory } from '../datasets/dataset.schema'
import type { ErrorType } from '../metrics/errorClassifier'
import { ERROR_TYPES } from '../metrics/errorClassifier'
import { averageLatencyMs, minLatencyMs, maxLatencyMs } from '../metrics/latencyMetrics'

function pct(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : (numerator / denominator) * 100
}

export interface ModelAggregate {
  model: string
  modelKey: string
  totalTests: number

  toolCorrectCount: number
  toolAccuracyPct: number

  parametersChecked: number
  parametersCorrect: number
  parameterAccuracyPct: number

  /** Denominator = records where a tool was actually called (structureValid !== null). */
  structureCheckedCount: number
  structureValidCount: number
  structureValidPct: number

  scheduleCheckedCount: number
  scheduleCorrectCount: number
  scheduleAccuracyPct: number

  ruleCheckedCount: number
  ruleCorrectCount: number
  ruleAccuracyPct: number

  minLatencyMs: number
  maxLatencyMs: number
  avgLatencyMs: number

  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
  avgTokensPerRequest: number

  totalCostUsd: number
  avgCostPerRequestUsd: number

  errorCounts: Record<ErrorType, number>
  totalErrors: number
}

/** Formula 1/2 (Bab III 3.11.3) aggregated across every record for one model. */
export function aggregateByModel(records: RawEvaluationRecord[]): ModelAggregate[] {
  const byModel = new Map<string, RawEvaluationRecord[]>()
  for (const record of records) {
    const list = byModel.get(record.modelKey) ?? []
    list.push(record)
    byModel.set(record.modelKey, list)
  }

  return Array.from(byModel.entries()).map(([modelKey, modelRecords]) =>
    aggregateOne(modelRecords[0].model, modelKey, modelRecords)
  )
}

function aggregateOne(
  model: string,
  modelKey: string,
  records: RawEvaluationRecord[]
): ModelAggregate {
  const totalTests = records.length
  const toolCorrectCount = records.filter((r) => r.toolCorrect).length

  // Formula 2 (A_parameter): sums raw parameter-key counts, not whole records —
  // "N_parameter diuji adalah jumlah seluruh parameter yang seharusnya dihasilkan."
  const parametersChecked = records.reduce(
    (sum, r) => sum + (r.parametersCheckedCount ?? 0),
    0
  )
  const parametersCorrect = records.reduce(
    (sum, r) => sum + (r.parametersCorrectCount ?? 0),
    0
  )

  const structureRecords = records.filter((r) => r.structureValid != null)
  const structureValidCount = structureRecords.filter(
    (r) => r.structureValid === true
  ).length

  const scheduleRecords = records.filter((r) => r.scheduleCorrect != null)
  const scheduleCorrectCount = scheduleRecords.filter(
    (r) => r.scheduleCorrect === true
  ).length

  const ruleRecords = records.filter((r) => r.dynamicRuleCorrect != null)
  const ruleCorrectCount = ruleRecords.filter((r) => r.dynamicRuleCorrect === true).length

  const latencies = records
    .map((r) => r.apiLatencyMs)
    .filter((v): v is number => v != null)

  const tokenRecords = records.filter((r) => r.totalTokens != null)
  const totalInputTokens = tokenRecords.reduce((sum, r) => sum + (r.inputTokens ?? 0), 0)
  const totalOutputTokens = tokenRecords.reduce(
    (sum, r) => sum + (r.outputTokens ?? 0),
    0
  )
  const totalTokens = totalInputTokens + totalOutputTokens

  const costRecords = records.filter((r) => r.totalCostUsd != null)
  const totalCostUsd = costRecords.reduce((sum, r) => sum + (r.totalCostUsd ?? 0), 0)

  const emptyErrorCounts: Record<ErrorType, number> = {
    WRONG_TOOL: 0,
    INVALID_OR_MISSING_PARAMETER: 0,
    INVALID_STRUCTURE: 0,
    FAILED_CLARIFICATION: 0,
    UNNECESSARY_TOOL_CALL: 0,
    OTHER: 0
  }
  const errorCounts = ERROR_TYPES.reduce((acc, type) => {
    acc[type] = records.filter((r) => r.errorTypes.includes(type)).length
    return acc
  }, emptyErrorCounts)
  const totalErrors = Object.values(errorCounts).reduce((a, b) => a + b, 0)

  return {
    model,
    modelKey,
    totalTests,
    toolCorrectCount,
    toolAccuracyPct: pct(toolCorrectCount, totalTests),
    parametersChecked,
    parametersCorrect,
    parameterAccuracyPct: pct(parametersCorrect, parametersChecked),
    structureCheckedCount: structureRecords.length,
    structureValidCount,
    structureValidPct: pct(structureValidCount, structureRecords.length),
    scheduleCheckedCount: scheduleRecords.length,
    scheduleCorrectCount,
    scheduleAccuracyPct: pct(scheduleCorrectCount, scheduleRecords.length),
    ruleCheckedCount: ruleRecords.length,
    ruleCorrectCount,
    ruleAccuracyPct: pct(ruleCorrectCount, ruleRecords.length),
    minLatencyMs: minLatencyMs(latencies),
    maxLatencyMs: maxLatencyMs(latencies),
    avgLatencyMs: averageLatencyMs(latencies),
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    avgTokensPerRequest:
      tokenRecords.length === 0 ? 0 : totalTokens / tokenRecords.length,
    totalCostUsd,
    avgCostPerRequestUsd:
      costRecords.length === 0 ? 0 : totalCostUsd / costRecords.length,
    errorCounts,
    totalErrors
  }
}

export interface ComplexityAggregate {
  model: string
  modelKey: string
  category: DatasetCategory
  totalTests: number
  toolAccuracyPct: number
  parameterAccuracyPct: number
  structureValidPct: number
}

/** Tabel 4.8: per model x {simple, medium, complex} only (poin 19 — ambiguous/invalid are behavior-focused, not accuracy-trend). */
export function aggregateByModelAndComplexity(
  records: RawEvaluationRecord[]
): ComplexityAggregate[] {
  const categories: DatasetCategory[] = ['simple', 'medium', 'complex']
  const byModel = new Map<string, RawEvaluationRecord[]>()
  for (const record of records) {
    const list = byModel.get(record.modelKey) ?? []
    list.push(record)
    byModel.set(record.modelKey, list)
  }

  const result: ComplexityAggregate[] = []
  for (const [modelKey, modelRecords] of byModel.entries()) {
    for (const category of categories) {
      const subset = modelRecords.filter((r) => r.category === category)
      if (subset.length === 0) continue
      const agg = aggregateOne(subset[0].model, modelKey, subset)
      result.push({
        model: agg.model,
        modelKey,
        category,
        totalTests: agg.totalTests,
        toolAccuracyPct: agg.toolAccuracyPct,
        parameterAccuracyPct: agg.parameterAccuracyPct,
        structureValidPct: agg.structureValidPct
      })
    }
  }
  return result
}
