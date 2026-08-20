import type { ChatToolCallTrace } from '../../src/services/chat/Chat.service'
import type {
  DatasetCategory,
  ExpectedBehavior,
  ExpectedToolCall
} from '../datasets/dataset.schema'
import type { ErrorType } from '../metrics/errorClassifier'

/**
 * One row = one (dataset × model × repetition) execution — poin 7. Field names are
 * camelCase here; reporters flatten to the snake_case-ish header names from the
 * brief when writing CSV (see evaluation/reporters).
 */
export interface RawEvaluationRecord {
  runId: string
  testCaseId: string
  category: DatasetCategory
  model: string
  modelKey: string
  provider: string
  repetition: number
  inputText: string

  expectedBehavior: ExpectedBehavior
  actualBehavior: 'tool_call' | 'no_tool_call'

  expectedToolCalls: ExpectedToolCall[]
  actualToolCalls: ChatToolCallTrace[]

  toolCorrect: boolean
  /** null when there were no matched tool-call pairs to check (nothing to compare). */
  parameterCorrect: boolean | null
  /**
   * Raw parameter-key counts backing formula 2 (A_parameter = N_parameter_benar /
   * N_parameter_diuji) — the aggregator sums these across records rather than
   * counting whole records, per poin 9's "jumlah seluruh parameter" definition.
   */
  parametersCheckedCount: number | null
  parametersCorrectCount: number | null
  /** null when the model made no tool call at all. */
  structureValid: boolean | null
  /** null when this test case has no schedule ground truth. */
  scheduleCorrect: boolean | null
  /** null when this test case has no dynamic-rule ground truth. */
  dynamicRuleCorrect: boolean | null

  /** Heuristic: no tool called AND the reply reads like a clarifying question — see evaluation/README.md limitations. */
  clarificationRequested: boolean
  /** null outside category==='ambiguous'. */
  clarificationCorrect: boolean | null
  /** null outside category==='invalid'. */
  invalidCommandHandledCorrect: boolean | null

  errorTypes: ErrorType[]

  /** Formula 3 (Bab III 3.11.3). null when the call never completed (see errorType). */
  apiLatencyMs: number | null
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
  inputCostUsd: number | null
  outputCostUsd: number | null
  totalCostUsd: number | null

  /** 1 = succeeded on the first try. >1 means it needed retries (poin 26: kept separate from clean-success latency). */
  attempt: number
  /** Transport/infra failure classification — distinct from the behavioral errorTypes[] above. Null on success. */
  errorType: string | null
  errorMessage: string | null

  rawModelReply: string | null
  timestamp: string
}
