import fs from 'fs'
import path from 'path'
import { loadFunctionalDataset } from '../datasets/loadDataset'
import { readFunctionalResults } from '../writers/resultWriter'
import { buildTable41, buildTable42, buildFunctionalSummary } from './functionalTables'
import { toCsv } from './csv'

function writeFile(runDir: string, filename: string, content: string): void {
  fs.writeFileSync(path.join(runDir, filename), content, 'utf-8')
}

/**
 * BAB 4.2 (poin 4.2.1/4.2.2) — reads functional-dataset.jsonl (ground truth/scenario
 * labels) + functional-results.jsonl (this run's outcomes) and writes both thesis
 * tables ready to paste in, plus a JSON summary. Call after runFunctionalEvaluation
 * finishes, or standalone via --mode report to regenerate after editing results.
 */
export function generateFunctionalReports(runDir: string, datasetPath: string): void {
  const dataset = loadFunctionalDataset(datasetPath)
  const results = readFunctionalResults(runDir)
  const table41 = buildTable41(dataset, results)
  const table42 = buildTable42(dataset, results)
  const summary = buildFunctionalSummary(table41, table42)

  writeFile(runDir, 'tabel-4.1-pengujian-fungsional.csv', toCsv(table41))
  writeFile(runDir, 'tabel-4.2-integrasi-e2e.csv', toCsv(table42))
  writeFile(
    runDir,
    'functional-summary.json',
    JSON.stringify(
      { generatedAt: new Date().toISOString(), ...summary, table41, table42 },
      null,
      2
    ) + '\n'
  )
}
