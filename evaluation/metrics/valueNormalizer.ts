/**
 * Semantic (not raw-string) equality for tool-call parameter values — per poin 9:
 * "Jangan sekadar melakukan raw JSON string comparison. Lakukan normalisasi apabila
 * memang secara semantik sama." Arrays of objects (rule conditions/actions, in
 * particular) are compared order-insensitively since the tool schema doesn't imply
 * a canonical order.
 */

function normalizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function isNumericLike(value: unknown): value is string | number {
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'string')
    return value.trim() !== '' && !Number.isNaN(Number(value))
  return false
}

export function semanticEqual(expected: unknown, actual: unknown): boolean {
  if (expected === actual) return true
  if (expected == null || actual == null) return expected == null && actual == null

  if (isNumericLike(expected) && isNumericLike(actual)) {
    return Number(expected) === Number(actual)
  }

  if (typeof expected === 'string' && typeof actual === 'string') {
    return normalizeString(expected) === normalizeString(actual)
  }

  if (typeof expected === 'boolean' || typeof actual === 'boolean') {
    return expected === actual
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) return false
    const remaining = [...actual]
    for (const expectedItem of expected) {
      const matchIndex = remaining.findIndex((actualItem) =>
        semanticEqual(expectedItem, actualItem)
      )
      if (matchIndex === -1) return false
      remaining.splice(matchIndex, 1)
    }
    return true
  }

  if (typeof expected === 'object' && typeof actual === 'object') {
    const expectedObj = expected as Record<string, unknown>
    const actualObj = actual as Record<string, unknown>
    const keys = new Set([...Object.keys(expectedObj), ...Object.keys(actualObj)])
    for (const key of keys) {
      if (!semanticEqual(expectedObj[key], actualObj[key])) return false
    }
    return true
  }

  return false
}
