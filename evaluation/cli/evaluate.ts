import path from 'path'
import { parseCliArgs } from './args'
import { evaluationConfig } from '../config/evaluation.config'
import { evalModels } from '../config/models.config'
import { loadDataset, loadFunctionalDataset } from '../datasets/loadDataset'
import { runLlmEvaluation } from '../runner/llmEvalRunner'
import { runFunctionalEvaluation } from '../runner/functionalRunner'
import { resolveRunDirectory, writeRunConfig } from '../writers/resultWriter'
import { generateReports } from '../reporters/writeReports'

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2))
  const outputRoot = args.output ?? evaluationConfig.resultsRootDir

  if (args.mode === 'report') {
    if (args.resume == null) {
      throw new Error(
        '--mode report requires --resume <runId> (the run directory to regenerate reports for).'
      )
    }
    const runDir = path.join(outputRoot, args.resume)
    generateReports(runDir)
    console.log(`Reports regenerated in ${runDir}`)
    return
  }

  if (args.mode === 'functional') {
    if (evaluationConfig.apiEmail == null || evaluationConfig.apiPassword == null) {
      throw new Error(
        'EVAL_API_EMAIL / EVAL_API_PASSWORD must be set to run --mode functional (a real account is required to call POST /api/v1/chat through the real pipeline).'
      )
    }

    const datasetPath = args.dataset ?? evaluationConfig.functionalDatasetPath
    const testCases = loadFunctionalDataset(datasetPath)
    const { runId, runDir } = resolveRunDirectory(outputRoot, args.resume)

    writeRunConfig(runDir, {
      mode: 'functional',
      datasetPath,
      baseUrl: evaluationConfig.apiBaseUrl,
      ackTimeoutMs: evaluationConfig.mqttAckTimeoutMs,
      ackPollIntervalMs: evaluationConfig.mqttAckPollIntervalMs,
      generatedAt: new Date().toISOString()
    })

    console.log(
      `Run ${runId}: ${testCases.length} functional test case(s) against ${evaluationConfig.apiBaseUrl}`
    )
    let done = 0
    await runFunctionalEvaluation({
      runId,
      runDir,
      baseUrl: evaluationConfig.apiBaseUrl,
      email: evaluationConfig.apiEmail,
      password: evaluationConfig.apiPassword,
      testCases,
      ackTimeoutMs: evaluationConfig.mqttAckTimeoutMs,
      ackPollIntervalMs: evaluationConfig.mqttAckPollIntervalMs,
      onRecord: (record) => {
        done += 1
        console.log(
          `[${done}/${testCases.length}] ${record.testCaseId} (${record.kind}) — integrationSuccess=${record.integrationSuccess} ackReceived=${record.ackReceived}`
        )
      }
    })

    console.log(`\nDone. Results: ${runDir}/functional-results.jsonl`)
    return
  }

  // mode === 'llm-eval'
  const datasetPath = args.dataset ?? evaluationConfig.datasetPath
  const allCases = loadDataset(datasetPath)
  const datasetCases =
    args.categories != null
      ? allCases.filter((c) => args.categories?.includes(c.category))
      : allCases

  const models =
    args.models === 'all'
      ? evalModels
      : evalModels.filter((m) => args.models.includes(m.key))
  if (models.length === 0) {
    throw new Error(
      `No model matched --model ${JSON.stringify(args.models)}. Valid keys: ${evalModels.map((m) => m.key).join(', ')}`
    )
  }

  const repetitions = args.repetitions ?? evaluationConfig.defaultRepetitions
  const concurrency = args.concurrency ?? evaluationConfig.defaultConcurrency
  const maxRetries = args.maxRetries ?? evaluationConfig.maxRetries

  const { runId, runDir } = resolveRunDirectory(outputRoot, args.resume)
  writeRunConfig(runDir, {
    mode: 'llm-eval',
    datasetPath,
    totalCases: datasetCases.length,
    categories: args.categories ?? 'all',
    repetitions,
    concurrency,
    maxRetries,
    models: models.map((m) => ({
      key: m.key,
      displayName: m.displayName,
      provider: m.provider,
      apiModel: m.apiModel,
      temperature: m.temperature,
      maxTokens: m.maxTokens
    })),
    generatedAt: new Date().toISOString()
  })

  const totalPlanned = datasetCases.length * models.length * repetitions
  console.log(
    `Run ${runId}: ${datasetCases.length} case(s) x ${models.length} model(s) x ${repetitions} repetition(s) = up to ${totalPlanned} record(s)`
  )
  if (args.resume != null)
    console.log('(resuming — already-succeeded records will be skipped)')

  let done = 0
  await runLlmEvaluation({
    runId,
    runDir,
    datasetCases,
    models,
    repetitions,
    concurrency,
    maxRetries,
    retryBaseDelayMs: evaluationConfig.retryBaseDelayMs,
    onRecord: (record) => {
      done += 1
      const status =
        record.errorType != null
          ? `ERROR(${record.errorType})`
          : record.errorTypes.length > 0
            ? `MISMATCH(${record.errorTypes.join('|')})`
            : 'OK'
      console.log(
        `[${done}/${totalPlanned}] ${record.testCaseId} x ${record.model} rep${record.repetition} — ${status}`
      )
    }
  })

  generateReports(runDir)
  console.log(`\nDone. Run: ${runId}`)
  console.log(`Raw results: ${runDir}/raw-results.jsonl`)
  console.log(`Reports: ${runDir}/summary.json + tabel-4.x CSVs`)
}

main()
  .then(() => {
    // Importing production services (MQTT client, BullMQ/Redis connections) opens
    // handles that keep the event loop alive well after this CLI's actual work is
    // done — force a clean exit instead of hanging indefinitely.
    process.exit(0)
  })
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
