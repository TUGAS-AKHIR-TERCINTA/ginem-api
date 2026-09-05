import pricing from '../config/pricing.json'

export interface ModelRate {
  inputPerMillion: number
  outputPerMillion: number
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
}

const rates = pricing.rates as Record<string, ModelRate>

export function getModelRate(modelKey: string): ModelRate {
  const rate = rates[modelKey]
  if (rate == null) {
    throw new Error(
      `No pricing entry for model key "${modelKey}" in evaluation/config/pricing.json. Add it before running cost calculations.`
    )
  }
  return rate
}

/** Formula 5: T_total,i = T_input,i + T_output,i */
export function totalTokens(usage: TokenUsage): number {
  return usage.inputTokens + usage.outputTokens
}

/** Formula 6: C_i = (T_input,i / 1,000,000 * H_input) + (T_output,i / 1,000,000 * H_output) */
export function estimateCostUsd(usage: TokenUsage, rate: ModelRate): number {
  const inputCost = (usage.inputTokens / 1_000_000) * rate.inputPerMillion
  const outputCost = (usage.outputTokens / 1_000_000) * rate.outputPerMillion
  return inputCost + outputCost
}

export function estimateCostBreakdownUsd(
  usage: TokenUsage,
  rate: ModelRate
): { inputCostUsd: number; outputCostUsd: number; totalCostUsd: number } {
  const inputCostUsd = (usage.inputTokens / 1_000_000) * rate.inputPerMillion
  const outputCostUsd = (usage.outputTokens / 1_000_000) * rate.outputPerMillion
  return { inputCostUsd, outputCostUsd, totalCostUsd: inputCostUsd + outputCostUsd }
}

export function convertUsdToIdr(usd: number, rate: number): number {
  return usd * rate
}
