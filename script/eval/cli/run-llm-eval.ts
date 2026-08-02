#!/usr/bin/env npx tsx
/**
 * CLI: LLM evaluation across configured providers.
 *
 * Usage (from CORE/):
 *   npx tsx script/eval/cli/run-llm-eval.ts
 *   npx tsx script/eval/cli/run-llm-eval.ts --models openai-gpt-4o-mini --cases S01,S02 --reps 1
 */
import { runLlmEvaluation } from '../runners/llmEval.runner'

function parseArgs(argv: string[]) {
  const out: {
    models?: string[]
    cases?: string[]
    reps?: number
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
    } else if (a === '--help' || a === '-h') {
      console.log(`LLM evaluation runner

Options:
  --models id1,id2   Subset of model ids from config/models.json
  --cases  S01,M02   Subset of case ids from data/dataset.json
  --reps   N         Repetition count (overrides config)

Environment:
  OPENAI_API_KEY     Required for openai provider
  DEEPSEEK_API_KEY   Required for deepseek provider
`)
      process.exit(0)
    }
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const { runId, results } = await runLlmEvaluation({
    modelIds: args.models,
    caseIds: args.cases,
    repetitions: args.reps
  })
  const ok = results.filter((r) => r.toolNameCorrect && r.behaviorMatch).length
  console.log(
    JSON.stringify(
      {
        runId,
        total: results.length,
        toolAndBehaviorOk: ok,
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
