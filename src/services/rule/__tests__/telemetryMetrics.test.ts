import { parseTelemetryMetrics, resolveMetricReading } from '../telemetryMetrics'

describe('parseTelemetryMetrics', () => {
  it('parses metric + value envelope', () => {
    expect(parseTelemetryMetrics({ metric: 'temperature', value: '28.5' })).toMatchObject(
      { temperature: 28.5, value: 28.5 }
    )
  })

  it('parses bare value as metrics.value', () => {
    expect(parseTelemetryMetrics({ value: '30' })).toEqual({ value: 30 })
  })

  it('parses multi-metric object', () => {
    expect(parseTelemetryMetrics({ temperature: 27, humidity: 60 })).toEqual({
      temperature: 27,
      humidity: 60
    })
  })

  it('parses JSON string inside value', () => {
    expect(parseTelemetryMetrics({ value: '{"temperature":22.1}' })).toMatchObject({
      temperature: 22.1
    })
  })
})

describe('resolveMetricReading', () => {
  it('prefers named metric then falls back to value', () => {
    expect(resolveMetricReading({ temperature: 26, value: 1 }, 'temperature')).toBe(26)
    expect(resolveMetricReading({ value: 29 }, 'temperature')).toBe(29)
    expect(resolveMetricReading({ humidity: 40 }, 'temperature')).toBeNull()
  })
})
