import { averageLatencyMs, minLatencyMs, maxLatencyMs } from '../metrics/latencyMetrics'

describe('latencyMetrics', () => {
  it('computes the average (formula 4)', () => {
    expect(averageLatencyMs([100, 200, 300])).toBe(200)
  })

  it('computes min and max', () => {
    expect(minLatencyMs([100, 200, 300])).toBe(100)
    expect(maxLatencyMs([100, 200, 300])).toBe(300)
  })

  it('returns 0 for an empty list rather than NaN', () => {
    expect(averageLatencyMs([])).toBe(0)
    expect(minLatencyMs([])).toBe(0)
    expect(maxLatencyMs([])).toBe(0)
  })
})
