import type { ModelAggregate, ComplexityAggregate } from './aggregate'

/**
 * Rows shaped exactly as the BAB IV table columns from the brief (poin 24), so
 * bab4Tables.csv files can be pasted straight into the thesis with a header rename
 * at most. Numbers are rounded to 2 decimals for readability; raw-results.jsonl
 * keeps full precision for anyone who wants to recompute.
 */

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export interface Table43Row {
  'Model LLM': string
  'Jumlah Pengujian': number
  'Tool Benar': number
  'Tool Salah': number
  'Ketepatan Tool (%)': number
}

export function buildTable43(aggregates: ModelAggregate[]): Table43Row[] {
  return aggregates.map((a) => ({
    'Model LLM': a.model,
    'Jumlah Pengujian': a.totalTests,
    'Tool Benar': a.toolCorrectCount,
    'Tool Salah': a.totalTests - a.toolCorrectCount,
    'Ketepatan Tool (%)': round2(a.toolAccuracyPct)
  }))
}

export interface Table44Row {
  'Model LLM': string
  'Ketepatan Parameter (%)': number
  'Struktur Valid (%)': number
  'Ketepatan Jadwal (%)': number
  'Ketepatan Dynamic Rule (%)': number
}

export function buildTable44(aggregates: ModelAggregate[]): Table44Row[] {
  return aggregates.map((a) => ({
    'Model LLM': a.model,
    'Ketepatan Parameter (%)': round2(a.parameterAccuracyPct),
    'Struktur Valid (%)': round2(a.structureValidPct),
    'Ketepatan Jadwal (%)': round2(a.scheduleAccuracyPct),
    'Ketepatan Dynamic Rule (%)': round2(a.ruleAccuracyPct)
  }))
}

export interface Table45Row {
  'Model LLM': string
  'Latensi Minimum (ms)': number
  'Latensi Maksimum (ms)': number
  'Rata-Rata Latensi (ms)': number
}

export function buildTable45(aggregates: ModelAggregate[]): Table45Row[] {
  return aggregates.map((a) => ({
    'Model LLM': a.model,
    'Latensi Minimum (ms)': round2(a.minLatencyMs),
    'Latensi Maksimum (ms)': round2(a.maxLatencyMs),
    'Rata-Rata Latensi (ms)': round2(a.avgLatencyMs)
  }))
}

export interface Table47Row {
  'Model LLM': string
  'Total Input Token': number
  'Total Output Token': number
  'Rata-Rata Token/Perintah': number
  'Total Biaya API (USD)': number
  'Rata-Rata Biaya/Perintah (USD)': number
}

export function buildTable47(aggregates: ModelAggregate[]): Table47Row[] {
  return aggregates.map((a) => ({
    'Model LLM': a.model,
    'Total Input Token': a.totalInputTokens,
    'Total Output Token': a.totalOutputTokens,
    'Rata-Rata Token/Perintah': round2(a.avgTokensPerRequest),
    'Total Biaya API (USD)': round2(a.totalCostUsd),
    'Rata-Rata Biaya/Perintah (USD)': round2(a.avgCostPerRequestUsd)
  }))
}

export interface Table48Row {
  'Model LLM': string
  Kompleksitas: string
  'Ketepatan Tool (%)': number
  'Ketepatan Parameter (%)': number
  'Struktur Valid (%)': number
}

const COMPLEXITY_LABEL: Record<string, string> = {
  simple: 'Sederhana',
  medium: 'Menengah',
  complex: 'Kompleks'
}

export function buildTable48(rows: ComplexityAggregate[]): Table48Row[] {
  return rows.map((r) => ({
    'Model LLM': r.model,
    Kompleksitas: COMPLEXITY_LABEL[r.category] ?? r.category,
    'Ketepatan Tool (%)': round2(r.toolAccuracyPct),
    'Ketepatan Parameter (%)': round2(r.parameterAccuracyPct),
    'Struktur Valid (%)': round2(r.structureValidPct)
  }))
}

export interface Table49Row {
  'Model LLM': string
  'Pemilihan Tool Salah': number
  'Parameter Tidak Tepat/Tidak Lengkap': number
  'Struktur Keluaran Tidak Valid': number
  'Gagal Meminta Klarifikasi': number
  'Pemanggilan Tool Tidak Diperlukan': number
  'Lainnya (OTHER)': number
  'Total Kesalahan': number
}

export function buildTable49(aggregates: ModelAggregate[]): Table49Row[] {
  return aggregates.map((a) => ({
    'Model LLM': a.model,
    'Pemilihan Tool Salah': a.errorCounts.WRONG_TOOL,
    'Parameter Tidak Tepat/Tidak Lengkap': a.errorCounts.INVALID_OR_MISSING_PARAMETER,
    'Struktur Keluaran Tidak Valid': a.errorCounts.INVALID_STRUCTURE,
    'Gagal Meminta Klarifikasi': a.errorCounts.FAILED_CLARIFICATION,
    'Pemanggilan Tool Tidak Diperlukan': a.errorCounts.UNNECESSARY_TOOL_CALL,
    'Lainnya (OTHER)': a.errorCounts.OTHER,
    'Total Kesalahan': a.totalErrors
  }))
}
