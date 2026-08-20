import { aggregateByModel, aggregateByModelAndComplexity } from '../reporters/aggregate'
import type { RawEvaluationRecord } from '../runner/types'

function record(overrides: Partial<RawEvaluationRecord>): RawEvaluationRecord {
  return {
    runId: 'run-test',
    testCaseId: 'TC001',
    category: 'simple',
    model: 'GPT-5.6 Terra',
    modelKey: 'openai:gpt-5.6-terra',
    provider: 'openai',
    repetition: 1,
    inputText: 'Nyalakan lampu kamar',
    expectedBehavior: 'tool_call',
    actualBehavior: 'tool_call',
    expectedToolCalls: [],
    actualToolCalls: [],
    toolCorrect: true,
    parameterCorrect: true,
    parametersCheckedCount: 2,
    parametersCorrectCount: 2,
    structureValid: true,
    scheduleCorrect: null,
    dynamicRuleCorrect: null,
    clarificationRequested: false,
    clarificationCorrect: null,
    invalidCommandHandledCorrect: null,
    errorTypes: [],
    apiLatencyMs: 500,
    inputTokens: 100,
    outputTokens: 20,
    totalTokens: 120,
    inputCostUsd: 0.001,
    outputCostUsd: 0.002,
    totalCostUsd: 0.003,
    attempt: 1,
    errorType: null,
    errorMessage: null,
    rawModelReply: 'ok',
    timestamp: new Date().toISOString(),
    ...overrides
  }
}

describe('aggregateByModel', () => {
  it('computes tool accuracy as correct/total (formula 1)', () => {
    const records = [
      record({ toolCorrect: true }),
      record({ toolCorrect: true }),
      record({ toolCorrect: false, errorTypes: ['WRONG_TOOL'] })
    ]

    const [agg] = aggregateByModel(records)
    expect(agg.totalTests).toBe(3)
    expect(agg.toolCorrectCount).toBe(2)
    expect(agg.toolAccuracyPct).toBeCloseTo((2 / 3) * 100, 5)
  })

  it('computes parameter accuracy from summed raw parameter-key counts, not record counts (formula 2)', () => {
    const records = [
      record({ parametersCheckedCount: 2, parametersCorrectCount: 2 }),
      record({ parametersCheckedCount: 3, parametersCorrectCount: 1 })
    ]

    const [agg] = aggregateByModel(records)
    // 3 correct out of 5 total parameter keys, NOT 1-of-2 records
    expect(agg.parametersChecked).toBe(5)
    expect(agg.parametersCorrect).toBe(3)
    expect(agg.parameterAccuracyPct).toBeCloseTo((3 / 5) * 100, 5)
  })

  it('excludes records with no tool call from the structure-valid denominator', () => {
    const records = [
      record({ structureValid: true }),
      record({ structureValid: false }),
      record({ structureValid: null }) // no tool called — shouldn't count either way
    ]

    const [agg] = aggregateByModel(records)
    expect(agg.structureCheckedCount).toBe(2)
    expect(agg.structureValidPct).toBeCloseTo(50, 5)
  })

  it('computes min/max/avg latency only from successful (non-null) records', () => {
    const records = [
      record({ apiLatencyMs: 100 }),
      record({ apiLatencyMs: 300 }),
      record({ apiLatencyMs: null, errorType: 'API_ERROR' })
    ]

    const [agg] = aggregateByModel(records)
    expect(agg.minLatencyMs).toBe(100)
    expect(agg.maxLatencyMs).toBe(300)
    expect(agg.avgLatencyMs).toBe(200)
  })

  it('sums tokens and cost, and averages per successful request', () => {
    const records = [
      record({
        inputTokens: 100,
        outputTokens: 20,
        totalTokens: 120,
        totalCostUsd: 0.01
      }),
      record({ inputTokens: 200, outputTokens: 40, totalTokens: 240, totalCostUsd: 0.02 })
    ]

    const [agg] = aggregateByModel(records)
    expect(agg.totalInputTokens).toBe(300)
    expect(agg.totalOutputTokens).toBe(60)
    expect(agg.totalTokens).toBe(360)
    expect(agg.avgTokensPerRequest).toBe(180)
    expect(agg.totalCostUsd).toBeCloseTo(0.03, 10)
    expect(agg.avgCostPerRequestUsd).toBeCloseTo(0.015, 10)
  })

  it('counts every declared error type across records, including multi-error records', () => {
    const records = [
      record({ errorTypes: ['FAILED_CLARIFICATION', 'UNNECESSARY_TOOL_CALL'] }),
      record({ errorTypes: ['UNNECESSARY_TOOL_CALL'] }),
      record({ errorTypes: [] })
    ]

    const [agg] = aggregateByModel(records)
    expect(agg.errorCounts.FAILED_CLARIFICATION).toBe(1)
    expect(agg.errorCounts.UNNECESSARY_TOOL_CALL).toBe(2)
    expect(agg.totalErrors).toBe(3)
  })

  it('produces one aggregate row per distinct model', () => {
    const records = [
      record({ modelKey: 'openai:gpt-5.6-terra', model: 'GPT-5.6 Terra' }),
      record({ modelKey: 'anthropic:claude-sonnet-5', model: 'Claude Sonnet 5' })
    ]

    const aggs = aggregateByModel(records)
    expect(aggs.map((a) => a.modelKey).sort()).toEqual(
      ['anthropic:claude-sonnet-5', 'openai:gpt-5.6-terra'].sort()
    )
  })
})

describe('aggregateByModelAndComplexity', () => {
  it('breaks down accuracy per model x {simple, medium, complex} only', () => {
    const records = [
      record({ category: 'simple', toolCorrect: true }),
      record({ category: 'medium', toolCorrect: false, errorTypes: ['WRONG_TOOL'] }),
      record({ category: 'ambiguous', toolCorrect: true }) // should be excluded
    ]

    const rows = aggregateByModelAndComplexity(records)
    const categories = rows.map((r) => r.category)
    expect(categories).toEqual(expect.arrayContaining(['simple', 'medium']))
    expect(categories).not.toContain('ambiguous')

    const simpleRow = rows.find((r) => r.category === 'simple')
    expect(simpleRow?.toolAccuracyPct).toBe(100)
    const mediumRow = rows.find((r) => r.category === 'medium')
    expect(mediumRow?.toolAccuracyPct).toBe(0)
  })
})
