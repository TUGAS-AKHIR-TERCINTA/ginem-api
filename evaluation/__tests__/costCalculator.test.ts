import {
  totalTokens,
  estimateCostUsd,
  estimateCostBreakdownUsd,
  getModelRate,
  convertUsdToIdr
} from '../metrics/costCalculator'

describe('costCalculator', () => {
  it('sums input and output tokens (formula 5)', () => {
    expect(totalTokens({ inputTokens: 100, outputTokens: 20 })).toBe(120)
  })

  it('computes cost per Tabel 3.13 DeepSeek-V4-Flash rate (formula 6)', () => {
    const rate = getModelRate('deepseek:deepseek-v4-flash')
    expect(rate).toEqual({ inputPerMillion: 0.14, outputPerMillion: 0.28 })

    const cost = estimateCostUsd(
      { inputTokens: 1_000_000, outputTokens: 1_000_000 },
      rate
    )
    expect(cost).toBeCloseTo(0.14 + 0.28, 10)
  })

  it('computes cost per Tabel 3.13 Claude Sonnet 5 rate', () => {
    const rate = getModelRate('anthropic:claude-sonnet-5')
    const cost = estimateCostUsd({ inputTokens: 500_000, outputTokens: 100_000 }, rate)
    expect(cost).toBeCloseTo(0.5 * 2.0 + 0.1 * 10.0, 10)
  })

  it('returns a full input/output/total cost breakdown', () => {
    const rate = { inputPerMillion: 2, outputPerMillion: 12 }
    const breakdown = estimateCostBreakdownUsd(
      { inputTokens: 1_000_000, outputTokens: 1_000_000 },
      rate
    )
    expect(breakdown).toEqual({ inputCostUsd: 2, outputCostUsd: 12, totalCostUsd: 14 })
  })

  it('throws a clear error for an unknown model key', () => {
    expect(() => getModelRate('unknown:model')).toThrow(/No pricing entry/)
  })

  it('converts USD to IDR using a configurable rate', () => {
    expect(convertUsdToIdr(1, 15800)).toBe(15800)
  })
})
