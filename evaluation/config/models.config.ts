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
  /** Tabel 3.10: temperature = 0.2 for all three models under test. */
  temperature: number
  /** Tabel 3.10: maksimum output token = 1024 for all three models under test. */
  maxTokens: number
}

export const evalModels: EvalModelConfig[] = [
  {
    key: 'openai:gpt-5.6-terra',
    displayName: 'GPT-5.6 Terra',
    provider: 'openai',
    apiModel: process.env.EVAL_OPENAI_MODEL ?? 'gpt-5.6-terra',
    temperature: 0.2,
    maxTokens: 1024
  },
  {
    key: 'anthropic:claude-sonnet-5',
    displayName: 'Claude Sonnet 5',
    provider: 'anthropic',
    apiModel: process.env.EVAL_ANTHROPIC_MODEL ?? 'claude-sonnet-5',
    temperature: 0.2,
    maxTokens: 1024
  },
  {
    key: 'deepseek:deepseek-v4-flash',
    displayName: 'DeepSeek-V4-Flash',
    provider: 'deepseek',
    apiModel: process.env.EVAL_DEEPSEEK_MODEL ?? 'deepseek-v4-flash',
    temperature: 0.2,
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
