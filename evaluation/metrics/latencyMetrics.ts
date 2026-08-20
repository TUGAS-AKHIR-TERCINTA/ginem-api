/**
 * Formula 3/4 (Bab III 3.11.3). Formula 3 (L_LLM,i = t_respons,i - t_permintaan,i) is
 * computed at the call site with high-resolution timestamps (see runner/llmEvalRunner.ts,
 * which uses process.hrtime.bigint()) — this module only implements the aggregate,
 * formula 4.
 */
export function averageLatencyMs(latenciesMs: number[]): number {
  if (latenciesMs.length === 0) return 0
  const sum = latenciesMs.reduce((acc, v) => acc + v, 0)
  return sum / latenciesMs.length
}

export function minLatencyMs(latenciesMs: number[]): number {
  return latenciesMs.length === 0 ? 0 : Math.min(...latenciesMs)
}

export function maxLatencyMs(latenciesMs: number[]): number {
  return latenciesMs.length === 0 ? 0 : Math.max(...latenciesMs)
}
