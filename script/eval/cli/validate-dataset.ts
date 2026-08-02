#!/usr/bin/env npx tsx
/**
 * Validate dataset.json against Zod schemas (no network).
 */
import { loadDataset, loadEvalConfig, loadModelsConfig } from '../lib/paths'

function main() {
  const config = loadEvalConfig()
  const dataset = loadDataset(config.datasetPath)
  const models = loadModelsConfig(config.modelsPath)

  const byCat: Record<string, number> = {}
  for (const c of dataset.cases) {
    byCat[c.category] = (byCat[c.category] ?? 0) + 1
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        version: dataset.version,
        language: dataset.language,
        caseCount: dataset.cases.length,
        byCategory: byCat,
        enabledModels: models.map((m) => m.id)
      },
      null,
      2
    )
  )
}

main()
