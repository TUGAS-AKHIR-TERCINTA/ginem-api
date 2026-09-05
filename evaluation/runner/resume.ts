import { readRawResults } from '../writers/resultWriter'

export function makeRecordKey(
  testCaseId: string,
  modelKey: string,
  repetition: number
): string {
  return `${testCaseId}::${modelKey}::${repetition}`
}

/**
 * Poin 26: on resume, only records that already SUCCEEDED (errorType == null) are
 * skipped — a record that failed after exhausting retries is re-run, not treated
 * as done.
 */
export function loadCompletedKeys(runDir: string): Set<string> {
  const records = readRawResults(runDir)
  const keys = new Set<string>()
  for (const record of records) {
    if (record.errorType == null) {
      keys.add(makeRecordKey(record.testCaseId, record.modelKey, record.repetition))
    }
  }
  return keys
}
