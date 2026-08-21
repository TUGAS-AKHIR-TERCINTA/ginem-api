import {
  buildTable43,
  buildTable44,
  buildTable45,
  buildTable46,
  buildTable47,
  buildTable49
} from '../reporters/bab4Tables'
import type { ModelAggregate, ComplexityAggregate } from '../reporters/aggregate'
import { ERROR_TYPES } from '../metrics/errorClassifier'

function aggregate(overrides: Partial<ModelAggregate>): ModelAggregate {
  const errorCounts = Object.fromEntries(
    ERROR_TYPES.map((t) => [t, 0])
  ) as ModelAggregate['errorCounts']
  return {
    model: 'GPT-5.6 Terra',
    modelKey: 'openai:gpt-5.6-terra',
    totalTests: 300,
    toolCorrectCount: 270,
    toolAccuracyPct: 90,
    parametersChecked: 500,
    parametersCorrect: 450,
    parameterAccuracyPct: 90,
    structureCheckedCount: 280,
    structureValidCount: 260,
    structureValidPct: (260 / 280) * 100,
    scheduleCheckedCount: 50,
    scheduleCorrectCount: 45,
    scheduleAccuracyPct: 90,
    ruleCheckedCount: 30,
    ruleCorrectCount: 27,
    ruleAccuracyPct: 90,
    minLatencyMs: 200,
    maxLatencyMs: 4000,
    avgLatencyMs: 1200,
    totalInputTokens: 30000,
    totalOutputTokens: 6000,
    totalTokens: 36000,
    avgTokensPerRequest: 120,
    totalCostUsd: 0.42,
    avgCostPerRequestUsd: 0.0014,
    errorCounts,
    totalErrors: 0,
    ...overrides
  }
}

describe('bab4Tables', () => {
  it('Tabel 4.3 exposes exactly the required columns', () => {
    const [row] = buildTable43([aggregate({})])
    expect(row).toEqual({
      'Model LLM': 'GPT-5.6 Terra',
      'Jumlah Pengujian': 300,
      'Tool Benar': 270,
      'Tool Salah': 30,
      'Ketepatan Tool (%)': 90
    })
  })

  it('Tabel 4.4 exposes exactly the required columns', () => {
    const [row] = buildTable44([aggregate({})])
    expect(Object.keys(row)).toEqual([
      'Model LLM',
      'Ketepatan Parameter (%)',
      'Struktur Valid (%)',
      'Ketepatan Jadwal (%)',
      'Ketepatan Dynamic Rule (%)'
    ])
    expect(row['Ketepatan Parameter (%)']).toBe(90)
  })

  it('Tabel 4.5 exposes latency min/max/avg', () => {
    const [row] = buildTable45([aggregate({})])
    expect(row).toEqual({
      'Model LLM': 'GPT-5.6 Terra',
      'Latensi Minimum (ms)': 200,
      'Latensi Maksimum (ms)': 4000,
      'Rata-Rata Latensi (ms)': 1200
    })
  })

  it('Tabel 4.6 pivots per-category latency into one row per model', () => {
    const rows: ComplexityAggregate[] = [
      {
        model: 'GPT-5.6 Terra',
        modelKey: 'openai:gpt-5.6-terra',
        category: 'simple',
        totalTests: 35,
        toolAccuracyPct: 90,
        parameterAccuracyPct: 90,
        structureValidPct: 90,
        avgLatencyMs: 500
      },
      {
        model: 'GPT-5.6 Terra',
        modelKey: 'openai:gpt-5.6-terra',
        category: 'medium',
        totalTests: 25,
        toolAccuracyPct: 85,
        parameterAccuracyPct: 85,
        structureValidPct: 85,
        avgLatencyMs: 800
      },
      {
        model: 'GPT-5.6 Terra',
        modelKey: 'openai:gpt-5.6-terra',
        category: 'complex',
        totalTests: 20,
        toolAccuracyPct: 75,
        parameterAccuracyPct: 75,
        structureValidPct: 75,
        avgLatencyMs: 1500
      }
    ]

    const [row] = buildTable46(rows)
    expect(row).toEqual({
      Model: 'GPT-5.6 Terra',
      'Sederhana (ms)': 500,
      'Menengah (ms)': 800,
      'Kompleks (ms)': 1500
    })
  })

  it('Tabel 4.6 fills 0 for a missing category rather than dropping the model', () => {
    const rows: ComplexityAggregate[] = [
      {
        model: 'Claude Sonnet 5',
        modelKey: 'anthropic:claude-sonnet-5',
        category: 'simple',
        totalTests: 35,
        toolAccuracyPct: 90,
        parameterAccuracyPct: 90,
        structureValidPct: 90,
        avgLatencyMs: 600
      }
    ]

    const [row] = buildTable46(rows)
    expect(row).toEqual({
      Model: 'Claude Sonnet 5',
      'Sederhana (ms)': 600,
      'Menengah (ms)': 0,
      'Kompleks (ms)': 0
    })
  })

  it('Tabel 4.7 exposes token and cost columns', () => {
    const [row] = buildTable47([aggregate({})])
    expect(row['Total Input Token']).toBe(30000)
    expect(row['Total Output Token']).toBe(6000)
    expect(row['Rata-Rata Token/Perintah']).toBe(120)
    expect(row['Total Biaya API (USD)']).toBe(0.42)
  })

  it('Tabel 4.9 maps each ErrorType to its named column and sums Total Kesalahan', () => {
    const errorCounts = Object.fromEntries(
      ERROR_TYPES.map((t) => [t, 0])
    ) as ModelAggregate['errorCounts']
    errorCounts.WRONG_TOOL = 5
    errorCounts.UNNECESSARY_TOOL_CALL = 3
    errorCounts.OTHER = 1

    const [row] = buildTable49([aggregate({ errorCounts, totalErrors: 9 })])
    expect(row['Pemilihan Tool Salah']).toBe(5)
    expect(row['Pemanggilan Tool Tidak Diperlukan']).toBe(3)
    expect(row['Lainnya (OTHER)']).toBe(1)
    expect(row['Total Kesalahan']).toBe(9)
  })
})
