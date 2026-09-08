import type { LLMProvider } from '../../src/services/llm/LLM.service'

export interface EvalModelConfig {
  /** Stable id used in raw-results.jsonl and as the pricing.json rate key. */
  key: string
  /** Label from Tabel 3.10 BAB III — shown in reports/tables as-is. */
  displayName: string
  provider: LLMProvider
  /**
   * Exact model id sent to the provider API. CONFIRM this against your provider
   * account before a paid run — placeholders here are best-effort guesses and
   * must not be trusted blindly. Override via env without touching code.
   */
  apiModel: string
  /** No temperature override for any model under test — each provider's own
   * default applies uniformly, since not every provider accepts (or supports the
   * same range of) a custom value. See evaluation/README.md §10 for rationale. */
  /** Tabel 3.10: maksimum output token = 1024 for all three models under test. */
  maxTokens: number
}

export const evalModels: EvalModelConfig[] = [
  {
    key: 'openai:gpt-5.6-luna',
    displayName: 'GPT-5.6 Luna',
    provider: 'openai',
    apiModel: process.env.EVAL_OPENAI_MODEL ?? 'gpt-5.6-luna',
    maxTokens: 1024
  },
  {
    key: 'anthropic:claude-sonnet-5',
    displayName: 'Claude Sonnet 5',
    provider: 'anthropic',
    apiModel: process.env.EVAL_ANTHROPIC_MODEL ?? 'claude-sonnet-5',
    maxTokens: 1024
  },
  {
    key: 'deepseek:deepseek-v4-flash',
    displayName: 'DeepSeek-V4-Flash',
    provider: 'deepseek',
    apiModel: process.env.EVAL_DEEPSEEK_MODEL ?? 'deepseek-v4-flash',
    maxTokens: 1024
  }
]

export function findEvalModel(key: string): EvalModelConfig {
  const found = evalModels.find((m) => m.key === key)
  if (found == null) {
    throw new Error(
      `Unknown evaluation model key: ${key}. Valid keys: ${evalModels.map((m) => m.key).join(', ')}`
    )
  }
  return found
}
