import {
  buildTable43,
  buildTable44,
  buildTable45,
  buildTable47,
  buildTable49
} from '../reporters/bab4Tables'
import type { ModelAggregate } from '../reporters/aggregate'
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
