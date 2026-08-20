import fs from 'fs'
import path from 'path'
import { readRawResults } from '../writers/resultWriter'
import { aggregateByModel, aggregateByModelAndComplexity } from './aggregate'
import {
  buildTable43,
  buildTable44,
  buildTable45,
  buildTable47,
  buildTable48,
  buildTable49
} from './bab4Tables'
import { toCsv } from './csv'

function writeFile(runDir: string, filename: string, content: string): void {
  fs.writeFileSync(path.join(runDir, filename), content, 'utf-8')
}

/**
 * Poin 23 (raw-analysis files, one row per model with full counts) + poin 24
 * (tabel-4.x.csv, columns matching the thesis tables verbatim so they can be
 * pasted in with at most a header rename). Both are derived from the same
 * raw-results.jsonl — run this any time after (or during, via --resume) a
 * benchmark to refresh summary.json and every CSV in the run directory.
 */
export function generateReports(runDir: string): void {
  const records = readRawResults(runDir)
  const modelAggregates = aggregateByModel(records)
  const complexityAggregates = aggregateByModelAndComplexity(records)

  writeFile(
    runDir,
    'summary.json',
    JSON.stringify(
      { generatedAt: new Date().toISOString(), modelAggregates, complexityAggregates },
      null,
      2
    ) + '\n'
  )

  writeFile(
    runDir,
    'tool-accuracy.csv',
    toCsv(
      modelAggregates.map((a) => ({
        model: a.model,
        totalTests: a.totalTests,
        toolCorrect: a.toolCorrectCount,
        toolWrong: a.totalTests - a.toolCorrectCount,
        toolAccuracyPct: a.toolAccuracyPct
      }))
    )
  )

  writeFile(
    runDir,
    'parameter-accuracy.csv',
    toCsv(
      modelAggregates.map((a) => ({
        model: a.model,
        parametersChecked: a.parametersChecked,
        parametersCorrect: a.parametersCorrect,
        parameterAccuracyPct: a.parameterAccuracyPct,
        structureChecked: a.structureCheckedCount,
        structureValid: a.structureValidCount,
        structureValidPct: a.structureValidPct
      }))
    )
  )

  writeFile(
    runDir,
    'latency.csv',
    toCsv(
      modelAggregates.map((a) => ({
        model: a.model,
        minLatencyMs: a.minLatencyMs,
        maxLatencyMs: a.maxLatencyMs,
        avgLatencyMs: a.avgLatencyMs
      }))
    )
  )

  writeFile(
    runDir,
    'token-cost.csv',
    toCsv(
      modelAggregates.map((a) => ({
        model: a.model,
        totalInputTokens: a.totalInputTokens,
        totalOutputTokens: a.totalOutputTokens,
        totalTokens: a.totalTokens,
        avgTokensPerRequest: a.avgTokensPerRequest,
        totalCostUsd: a.totalCostUsd,
        avgCostPerRequestUsd: a.avgCostPerRequestUsd
      }))
    )
  )

  writeFile(
    runDir,
    'complexity.csv',
    toCsv(
      complexityAggregates.map((c) => ({
        model: c.model,
        category: c.category,
        totalTests: c.totalTests,
        toolAccuracyPct: c.toolAccuracyPct,
        parameterAccuracyPct: c.parameterAccuracyPct,
        structureValidPct: c.structureValidPct
      }))
    )
  )

  writeFile(
    runDir,
    'error-distribution.csv',
    toCsv(
      modelAggregates.map((a) => ({
        model: a.model,
        WRONG_TOOL: a.errorCounts.WRONG_TOOL,
        INVALID_OR_MISSING_PARAMETER: a.errorCounts.INVALID_OR_MISSING_PARAMETER,
        INVALID_STRUCTURE: a.errorCounts.INVALID_STRUCTURE,
        FAILED_CLARIFICATION: a.errorCounts.FAILED_CLARIFICATION,
        UNNECESSARY_TOOL_CALL: a.errorCounts.UNNECESSARY_TOOL_CALL,
        OTHER: a.errorCounts.OTHER,
        totalErrors: a.totalErrors
      }))
    )
  )

  writeFile(runDir, 'tabel-4.3-ketepatan-tool.csv', toCsv(buildTable43(modelAggregates)))
  writeFile(
    runDir,
    'tabel-4.4-parameter-struktur.csv',
    toCsv(buildTable44(modelAggregates))
  )
  writeFile(runDir, 'tabel-4.5-latensi.csv', toCsv(buildTable45(modelAggregates)))
  writeFile(runDir, 'tabel-4.7-token-biaya.csv', toCsv(buildTable47(modelAggregates)))
  writeFile(
    runDir,
    'tabel-4.8-kompleksitas.csv',
    toCsv(buildTable48(complexityAggregates))
  )
  writeFile(
    runDir,
    'tabel-4.9-distribusi-kesalahan.csv',
    toCsv(buildTable49(modelAggregates))
  )
}
