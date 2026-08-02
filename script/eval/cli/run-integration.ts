#!/usr/bin/env npx tsx
/**
 * CLI: System / integration testing (dry-run by default).
 *
 * Usage (from CORE/):
 *   npx tsx script/eval/cli/run-integration.ts
 *   npx tsx script/eval/cli/run-integration.ts --mode dry-run
 *   npx tsx script/eval/cli/run-integration.ts --mode real-device --enable-real-device --device-id 1
 */
import {
  runIntegrationEvaluation,
  type IntegrationMode
} from '../runners/integration.runner'

function parseArgs(argv: string[]) {
  const out: {
    mode?: IntegrationMode
    enableRealDevice?: boolean
    cases?: string[]
    mqttUrl?: string
    deviceId?: number
  } = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--mode' && argv[i + 1]) {
      const m = argv[++i]
      if (m !== 'dry-run' && m !== 'real-device') {
        throw new Error(`Invalid --mode ${m}`)
      }
      out.mode = m
    } else if (a === '--enable-real-device') {
      out.enableRealDevice = true
    } else if (a === '--cases' && argv[i + 1]) {
      out.cases = argv[++i]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (a === '--mqtt-url' && argv[i + 1]) {
      out.mqttUrl = argv[++i]
    } else if (a === '--device-id' && argv[i + 1]) {
      out.deviceId = Number(argv[++i])
    } else if (a === '--help' || a === '-h') {
      console.log(`Integration / system test runner

Options:
  --mode dry-run|real-device   Default: dry-run (from config)
  --enable-real-device        REQUIRED together with --mode real-device
  --cases S01,M02             Optional case filter
  --mqtt-url mqtt://host:1883 Override broker URL
  --device-id N               Device id for MQTT topics

Safety:
  Physical MQTT publishes never run unless BOTH
  --mode real-device AND --enable-real-device are set.
`)
      process.exit(0)
    }
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const { runId, results } = await runIntegrationEvaluation({
    mode: args.mode,
    enableRealDevice: args.enableRealDevice,
    caseIds: args.cases,
    mqttUrl: args.mqttUrl,
    deviceId: args.deviceId
  })
  const functional = results.filter((r) => r.functionalSuccess).length
  console.log(
    JSON.stringify(
      {
        runId,
        mode: results[0]?.mode ?? args.mode ?? 'dry-run',
        total: results.length,
        functionalSuccess: functional,
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
