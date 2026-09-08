import fs from 'fs'
import path from 'path'
// Side-effect import: runs dotenv.config() before evaluation.config.ts reads
// process.env.EVAL_* below. Without this, .env only gets loaded once something
// deeper in the import chain (e.g. models.config -> LLM.service -> appConfig)
// pulls it in — by then evaluation.config's top-level `export const` has already
// captured `undefined` for every EVAL_* var and it's too late to fix.
import '../../src/configs/appConfig'
import { parseCliArgs } from './args'
import { evaluationConfig } from '../config/evaluation.config'
import { evalModels } from '../config/models.config'
import { loadDataset, loadFunctionalDataset } from '../datasets/loadDataset'
import { runLlmEvaluation } from '../runner/llmEvalRunner'
import { runFunctionalEvaluation } from '../runner/functionalRunner'
import {
  resolveRunDirectory,
  writeRunConfig,
  rawResultsPath,
  functionalResultsPath
} from '../writers/resultWriter'
import { generateReports } from '../reporters/writeReports'
import { generateFunctionalReports } from '../reporters/writeFunctionalReports'

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
    let regenerated = 0

    if (fs.existsSync(rawResultsPath(runDir))) {
      generateReports(runDir)
      console.log(`LLM-eval reports (Tabel 4.3-4.9) regenerated in ${runDir}`)
      regenerated += 1
    }

    if (fs.existsSync(functionalResultsPath(runDir))) {
      const configPath = path.join(runDir, 'config.json')
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as {
        datasetPath?: string
      }
      const datasetPath =
        args.dataset ?? config.datasetPath ?? evaluationConfig.functionalDatasetPath
      generateFunctionalReports(runDir, datasetPath)
      console.log(`Functional reports (Tabel 4.1-4.2) regenerated in ${runDir}`)
      regenerated += 1
    }

    if (regenerated === 0) {
      throw new Error(
        `No raw-results.jsonl or functional-results.jsonl found in ${runDir} — nothing to regenerate.`
      )
    }
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
      sensorFreshnessMs: evaluationConfig.sensorFreshnessMs,
      onRecord: (record) => {
        done += 1
        console.log(
          `[${done}/${testCases.length}] ${record.testCaseId} (${record.kind}) — integrationSuccess=${record.integrationSuccess} ackReceived=${record.ackReceived}`
        )
      }
    })

    generateFunctionalReports(runDir, datasetPath)
    console.log(`\nDone. Run: ${runId}`)
    console.log(`Raw results: ${runDir}/functional-results.jsonl`)
    console.log(
      `Reports: ${runDir}/tabel-4.1-pengujian-fungsional.csv + tabel-4.2-integrasi-e2e.csv + functional-summary.json`
    )
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
      temperature: 'provider default (not overridden)',
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

  // Ctrl+C (or a SIGTERM, e.g. from a process manager) sets this flag instead of
  // killing the process outright — runWithConcurrency stops handing out new tasks
  // once it's true but lets whatever's already in-flight finish and get written to
  // raw-results.jsonl, so nothing completed is ever lost or silently corrupted.
  // Pressing Ctrl+C a second time falls through to Node's default (immediate exit)
  // for anyone who genuinely needs to kill it right now.
  let stopRequested = false
  const resumeHint = buildResumeCommand(args, runId)
  const onInterrupt = (signal: NodeJS.Signals): void => {
    if (stopRequested) return
    stopRequested = true
    console.log(
      `\n\n${signal} received — finishing in-flight request(s), then pausing (not cancelling mid-request; the current API call already in flight will complete normally).`
    )
    console.log(
      `Press ${signal === 'SIGINT' ? 'Ctrl+C' : signal} again to force-quit immediately.`
    )
    console.log(`\nTo resume the remaining cases later, run:\n  ${resumeHint}\n`)
    process.off('SIGINT', onInterrupt)
    process.off('SIGTERM', onInterrupt)
  }
  process.on('SIGINT', onInterrupt)
  process.on('SIGTERM', onInterrupt)

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
    shouldStop: () => stopRequested,
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
  process.off('SIGINT', onInterrupt)
  process.off('SIGTERM', onInterrupt)

  generateReports(runDir)

  if (stopRequested && done < totalPlanned) {
    console.log(
      `\nPaused. Run: ${runId} (${done}/${totalPlanned} record(s) completed so far)`
    )
    console.log(`Raw results so far: ${runDir}/raw-results.jsonl`)
    console.log(`Partial reports: ${runDir}/summary.json + tabel-4.x CSVs`)
    console.log(`\nResume the remaining cases with:\n  ${resumeHint}`)
  } else {
    console.log(`\nDone. Run: ${runId}`)
    console.log(`Raw results: ${runDir}/raw-results.jsonl`)
    console.log(`Reports: ${runDir}/summary.json + tabel-4.x CSVs`)
  }
}

/** Reconstructs a ready-to-paste `npm run evaluate -- ...` command that resumes
 * this exact run — same flags the user already passed, plus `--resume <runId>`. */
function buildResumeCommand(
  args: ReturnType<typeof parseCliArgs>,
  runId: string
): string {
  const parts = ['npm run evaluate --', `--resume ${runId}`]
  if (args.models !== 'all') parts.push(`--model ${args.models.join(',')}`)
  if (args.dataset != null) parts.push(`--dataset ${args.dataset}`)
  if (args.repetitions != null) parts.push(`--repetitions ${args.repetitions}`)
  if (args.categories != null) parts.push(`--category ${args.categories.join(',')}`)
  if (args.concurrency != null) parts.push(`--concurrency ${args.concurrency}`)
  if (args.maxRetries != null) parts.push(`--max-retries ${args.maxRetries}`)
  return parts.join(' ')
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
