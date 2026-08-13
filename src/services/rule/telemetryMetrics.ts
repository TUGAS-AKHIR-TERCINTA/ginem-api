/**
 * Parse telemetry MQTT payloads into numeric metrics for Rule Engine.
 * Supports:
 * - { metric: "temperature", value: 28 }
 * - { temperature: 28, humidity: 60 }
 * - { value: "28" } → metrics.value = 28 (single-metric sensor fallback)
 * - { value: "{\"temperature\":28}" } JSON string
 */
export function parseTelemetryMetrics(
  payload: unknown
): Record<string, number> {
  const metrics: Record<string, number> = {}

  if (payload == null) return metrics

  let data: unknown = payload
  if (typeof payload === 'string') {
    try {
      data = JSON.parse(payload)
    } catch {
      const n = Number(payload)
      if (Number.isFinite(n)) metrics.value = n
      return metrics
    }
  }

  if (typeof data !== 'object' || data == null || Array.isArray(data)) {
    return metrics
  }

  const obj = data as Record<string, unknown>

  // Nested JSON in value
  if (typeof obj.value === 'string') {
    const trimmed = obj.value.trim()
    if (trimmed.startsWith('{')) {
      try {
        const nested = JSON.parse(trimmed) as Record<string, unknown>
        Object.assign(metrics, extractNumericFields(nested))
      } catch {
        const n = Number(trimmed)
        if (Number.isFinite(n)) metrics.value = n
      }
    } else {
      const n = Number(trimmed)
      if (Number.isFinite(n)) metrics.value = n
    }
  } else if (typeof obj.value === 'number' && Number.isFinite(obj.value)) {
    metrics.value = obj.value
  }

  // Explicit metric + value
  if (typeof obj.metric === 'string' && obj.metric.trim() !== '') {
    const key = obj.metric.trim().toLowerCase()
    if (typeof obj.value === 'number' && Number.isFinite(obj.value)) {
      metrics[key] = obj.value
    } else if (typeof obj.value === 'string') {
      const n = Number(obj.value)
      if (Number.isFinite(n)) metrics[key] = n
    }
  }

  Object.assign(metrics, extractNumericFields(obj, ['metric', 'value']))

  return metrics
}

function extractNumericFields(
  obj: Record<string, unknown>,
  skipKeys: string[] = []
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [key, raw] of Object.entries(obj)) {
    if (skipKeys.includes(key)) continue
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      out[key.toLowerCase()] = raw
    } else if (typeof raw === 'string' && raw.trim() !== '') {
      const n = Number(raw)
      if (Number.isFinite(n)) out[key.toLowerCase()] = n
    }
  }
  return out
}

/** Resolve reading for a rule metric; fall back to bare `value` for single-metric sensors. */
export function resolveMetricReading(
  metrics: Record<string, number>,
  metric: string
): number | null {
  const key = metric.toLowerCase()
  if (metrics[key] != null && Number.isFinite(metrics[key])) {
    return metrics[key]
  }
  if (metrics.value != null && Number.isFinite(metrics.value)) {
    return metrics.value
  }
  return null
}
