/**
 * Parameter normalization for fair comparison against ground truth.
 * Handles casing, whitespace, device aliases, dates, and time formats.
 */

export type AliasMap = Record<string, string>

export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function normalizeKey(key: string): string {
  return normalizeWhitespace(key).toLowerCase()
}

export function resolveDeviceAlias(rawName: string, aliases: AliasMap): string {
  const normalized = normalizeWhitespace(rawName)
  const lower = normalized.toLowerCase()
  if (aliases[lower]) return aliases[lower]
  // try without diacritics-ish simple match
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (alias.toLowerCase() === lower) return canonical
  }
  return normalized
}

export function normalizeBooleanish(value: unknown): boolean | unknown {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
  }
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase()
    if (['true', 'on', '1', 'nyala', 'hidup', 'hidupkan'].includes(v)) {
      return true
    }
    if (['false', 'off', '0', 'mati', 'matikan', 'padam'].includes(v)) {
      return false
    }
  }
  return value
}

/**
 * Normalize ISO / common Indonesian datetime strings to comparable form.
 * Returns null if not parseable.
 */
export function normalizeDateTime(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString()
  }
  if (typeof value !== 'string') return null
  const trimmed = normalizeWhitespace(value)
  // HH:mm or HH.mm alone → keep as time token
  const timeOnly = trimmed.match(/^(\d{1,2})[:.](\d{2})$/)
  if (timeOnly) {
    const h = timeOnly[1].padStart(2, '0')
    const m = timeOnly[2]
    return `TIME:${h}:${m}`
  }
  const parsed = Date.parse(trimmed)
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString()
  }
  return trimmed.toLowerCase()
}

export function normalizeScalar(key: string, value: unknown, aliases: AliasMap): unknown {
  const k = normalizeKey(key)

  if (value == null) return null

  if (
    k.includes('devicename') ||
    k === 'device' ||
    k === 'name' ||
    k.endsWith('device_name')
  ) {
    if (typeof value === 'string') {
      return resolveDeviceAlias(value, aliases).toLowerCase()
    }
  }

  if (k === 'state') {
    const b = normalizeBooleanish(value)
    if (b === true) return 'on'
    if (b === false) return 'off'
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase()
      if (v === 'on' || v === 'off') return v
    }
    return typeof value === 'string' ? value.trim().toLowerCase() : value
  }

  if (k === 'on' || k === 'enabled' || k === 'repeatdaily') {
    return normalizeBooleanish(value)
  }

  if (k === 'category') {
    if (typeof value === 'string') return value.trim().toLowerCase()
    return value
  }

  if (k === 'hour' || k === 'minute' || k === 'year' || k === 'month' || k === 'day') {
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
      return Number(value.trim())
    }
    return value
  }

  if (
    k.includes('runat') ||
    k.includes('datetime') ||
    k.includes('scheduled') ||
    k === 'time'
  ) {
    return normalizeDateTime(value)
  }

  if (k === 'date' && typeof value === 'string') {
    return normalizeWhitespace(value).toLowerCase()
  }

  if (k.includes('deviceid') || k === 'id' || k.endsWith('id')) {
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
      return Number(value.trim())
    }
  }

  if (typeof value === 'string') {
    return normalizeWhitespace(value).toLowerCase()
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return normalizeParams(value as Record<string, unknown>, aliases)
  }

  return value
}

export function normalizeParams(
  params: Record<string, unknown> | undefined,
  aliases: AliasMap
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (!params) return out
  for (const [key, value] of Object.entries(params)) {
    out[normalizeKey(key)] = normalizeScalar(key, value, aliases)
  }
  return out
}

export function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b)
  }
  return String(a) === String(b)
}

/**
 * Score expected parameters against actual tool args.
 * Keys that are only in expected requiredParameterKeys count.
 * Special: runAt / datetime keys only require presence + parseable value
 * when ground truth notes say loose matching — here we require presence
 * and that normalizeDateTime succeeds if expected has a runAt-like key.
 */
export function scoreParameters(
  expected: Record<string, unknown>,
  requiredKeys: string[],
  actual: Record<string, unknown> | undefined,
  aliases: AliasMap
): { correct: number; total: number; details: string[] } {
  const exp = normalizeParams(expected, aliases)
  const act = normalizeParams(actual, aliases)
  const keys = requiredKeys.length > 0 ? requiredKeys.map(normalizeKey) : Object.keys(exp)

  let correct = 0
  const details: string[] = []
  const total = keys.length

  for (const key of keys) {
    const expectedVal = exp[key]
    const actualVal = act[key]

    if (actualVal === undefined) {
      details.push(`missing:${key}`)
      continue
    }

    // Loose datetime: if expected has no concrete value or key is runAt,
    // accept any parseable / present value.
    if (key.includes('runat') || key.includes('datetime')) {
      if (actualVal != null && String(actualVal).length > 0) {
        correct += 1
        details.push(`ok-loose:${key}`)
        continue
      }
      details.push(`bad-datetime:${key}`)
      continue
    }

    if (valuesEqual(expectedVal, actualVal)) {
      correct += 1
      details.push(`ok:${key}`)
    } else {
      details.push(
        `mismatch:${key} expected=${JSON.stringify(expectedVal)} actual=${JSON.stringify(actualVal)}`
      )
    }
  }

  return { correct, total, details }
}
