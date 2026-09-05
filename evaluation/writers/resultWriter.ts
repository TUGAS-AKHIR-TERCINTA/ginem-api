import fs from 'fs'
import path from 'path'
import type { RawEvaluationRecord } from '../runner/types'
import type { FunctionalEvaluationRecord } from '../runner/functionalTypes'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatRunTimestamp(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}

/**
 * Poin 23/26: one directory per run, raw JSONL written incrementally (one line per
 * finished record) so a crash mid-benchmark never loses already-completed work.
 */
export function resolveRunDirectory(
  resultsRootDir: string,
  runId?: string
): { runId: string; runDir: string } {
  const id = runId ?? `run-${formatRunTimestamp(new Date())}`
  const runDir = path.join(resultsRootDir, id)
  fs.mkdirSync(runDir, { recursive: true })
  return { runId: id, runDir }
}

export function writeRunConfig(runDir: string, config: unknown): void {
  fs.writeFileSync(
    path.join(runDir, 'config.json'),
    JSON.stringify(config, null, 2) + '\n',
    'utf-8'
  )
}

export function appendRawResult(runDir: string, record: RawEvaluationRecord): void {
  fs.appendFileSync(
    path.join(runDir, 'raw-results.jsonl'),
    JSON.stringify(record) + '\n',
    'utf-8'
  )
  if (record.errorType != null) {
    fs.appendFileSync(
      path.join(runDir, 'errors.jsonl'),
      JSON.stringify(record) + '\n',
      'utf-8'
    )
  }
}

export function rawResultsPath(runDir: string): string {
  return path.join(runDir, 'raw-results.jsonl')
}

export function readRawResults(runDir: string): RawEvaluationRecord[] {
  const filePath = rawResultsPath(runDir)
  if (!fs.existsSync(filePath)) return []
  return fs
    .readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as RawEvaluationRecord)
}

export function appendFunctionalResult(
  runDir: string,
  record: FunctionalEvaluationRecord
): void {
  fs.appendFileSync(
    path.join(runDir, 'functional-results.jsonl'),
    JSON.stringify(record) + '\n',
    'utf-8'
  )
}

export function functionalResultsPath(runDir: string): string {
  return path.join(runDir, 'functional-results.jsonl')
}

export function readFunctionalResults(runDir: string): FunctionalEvaluationRecord[] {
  const filePath = functionalResultsPath(runDir)
  if (!fs.existsSync(filePath)) return []
  return fs
    .readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as FunctionalEvaluationRecord)
}
