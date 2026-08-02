#!/usr/bin/env npx tsx
/**
 * End-to-end evaluation via ChatService (no RabbitMQ).
 * Executes real device tools and may publish MQTT commands to ESP32.
 *
 * Usage (from CORE/):
 *   npx tsx script/eval/cli/run-e2e-eval.ts --enable-real-device
 *   npx tsx script/eval/cli/run-e2e-eval.ts --enable-real-device --models openai-gpt-4o-mini --cases S01,S02
 */
import { runE2EChatEvaluation } from '../runners/e2eChat.runner'

function parseArgs(argv: string[]) {
  const out: {
    models?: string[]
    cases?: string[]
    reps?: number
    enableRealDevice?: boolean
  } = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--models' && argv[i + 1]) {
      out.models = argv[++i]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (a === '--cases' && argv[i + 1]) {
      out.cases = argv[++i]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (a === '--reps' && argv[i + 1]) {
      out.reps = Number(argv[++i])
    } else if (a === '--enable-real-device') {
      out.enableRealDevice = true
    } else if (a === '--help' || a === '-h') {
      console.log(`E2E ChatService evaluation

Flow: dataset command → ChatService.query → RAG + agent + MCP tools → MQTT → device

Required:
  --enable-real-device   Explicit opt-in (tools + MQTT are real)

Options:
  --models id1,id2
  --cases  S01,M02
  --reps   N

Environment: OPENAI_API_KEY, DEEPSEEK_API_KEY, DB_*, MQTT_* (same as app)
`)
      process.exit(0)
    }
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.enableRealDevice !== true) {
    console.error(
      'Refusing to start: pass --enable-real-device to run real ChatService + MQTT E2E tests.'
    )
    process.exit(2)
  }

  const { runId, results } = await runE2EChatEvaluation({
    enableRealDevice: true,
    modelIds: args.models,
    caseIds: args.cases,
    repetitions: args.reps
  })

  const functional = results.filter((r) => r.functionalSuccess).length
  const mqttOk = results.filter((r) => r.mqttSuccess).length
  console.log(
    JSON.stringify(
      {
        runId,
        total: results.length,
        functionalSuccess: functional,
        mqttSuccess: mqttOk,
        outputHint: `script/eval/output/processed/${runId}/`
      },
      null,
      2
    )
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
