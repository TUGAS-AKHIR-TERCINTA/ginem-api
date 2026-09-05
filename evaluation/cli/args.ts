import { datasetCategorySchema, type DatasetCategory } from '../datasets/dataset.schema'

export type CliMode = 'llm-eval' | 'functional' | 'report'

export interface CliArgs {
  mode: CliMode
  models: 'all' | string[]
  dataset?: string
  repetitions?: number
  categories?: DatasetCategory[]
  output?: string
  resume?: string
  concurrency?: number
  maxRetries?: number
}

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
}

/**
 * Minimal manual parser for poin 25's --model/--dataset/--repetitions/--category/
 * --output/--dry-run/--resume flags — no new dependency for a handful of flags.
 * --dry-run is accepted but is a no-op: --mode llm-eval is always dry-run (BAB 4.3
 * must never touch real MQTT/hardware — see evaluation/README.md), and --mode
 * functional is always real by design, so the flag has nothing to toggle either way.
 */
export function parseCliArgs(argv: string[]): CliArgs {
  const args: CliArgs = { mode: 'llm-eval', models: 'all' }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    const next = (): string => {
      const value = argv[i + 1]
      if (value == null) throw new Error(`Missing value for ${token}`)
      i += 1
      return value
    }

    switch (token) {
      case '--mode': {
        const value = next()
        if (value !== 'llm-eval' && value !== 'functional' && value !== 'report') {
          throw new Error(
            `Invalid --mode "${value}" (expected llm-eval | functional | report)`
          )
        }
        args.mode = value
        break
      }
      case '--model': {
        const value = next()
        args.models = value === 'all' ? 'all' : splitCsv(value)
        break
      }
      case '--dataset':
        args.dataset = next()
        break
      case '--repetitions': {
        const value = Number(next())
        if (!Number.isInteger(value) || value < 1)
          throw new Error('--repetitions must be a positive integer')
        args.repetitions = value
        break
      }
      case '--category': {
        const values = splitCsv(next())
        args.categories = values.map((v) => datasetCategorySchema.parse(v))
        break
      }
      case '--output':
        args.output = next()
        break
      case '--resume':
        args.resume = next()
        break
      case '--concurrency': {
        const value = Number(next())
        if (!Number.isInteger(value) || value < 1)
          throw new Error('--concurrency must be a positive integer')
        args.concurrency = value
        break
      }
      case '--max-retries': {
        const value = Number(next())
        if (!Number.isInteger(value) || value < 0)
          throw new Error('--max-retries must be a non-negative integer')
        args.maxRetries = value
        break
      }
      case '--dry-run':
        // accepted for CLI compatibility with the brief — see doc comment above.
        break
      default:
        throw new Error(`Unknown argument: ${token}`)
    }
  }

  return args
}
