function escapeCsvValue(value: unknown): string {
  const str = value == null ? '' : String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

/**
 * Rows are typically literal-column interfaces (Table43Row, etc.) rather than
 * index-signature objects, so this stays generic instead of requiring
 * Record<string, unknown> — that would force every *Row interface to carry a
 * redundant index signature just to satisfy this helper.
 */
export function toCsv<T extends object>(rows: T[], columns?: Array<keyof T>): string {
  if (rows.length === 0 && columns == null) return ''
  const cols = columns ?? (Object.keys(rows[0]) as Array<keyof T>)
  const lines = [cols.map(String).join(',')]
  for (const row of rows) {
    lines.push(cols.map((c) => escapeCsvValue(row[c])).join(','))
  }
  return lines.join('\n') + '\n'
}
