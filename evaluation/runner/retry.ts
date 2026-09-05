export class RetryExhaustedError extends Error {
  constructor(
    public readonly cause: unknown,
    public readonly attempts: number
  ) {
    super(`Failed after ${attempts} attempt(s): ${String(cause)}`)
    this.name = 'RetryExhaustedError'
  }
}

export interface RetryOutcome<T> {
  value: T
  attempts: number
}

export interface RetryOptions {
  maxRetries: number
  baseDelayMs: number
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Poin 26: retry transient network/API errors with a bounded, exponential backoff.
 * The caller still learns how many attempts it took (attempts > 1 means retried)
 * so retried latency is never silently blended with clean-success latency.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<RetryOutcome<T>> {
  let lastError: unknown
  const totalAttempts = options.maxRetries + 1

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    try {
      const value = await fn()
      return { value, attempts: attempt }
    } catch (err) {
      lastError = err
      if (attempt < totalAttempts) {
        await sleep(options.baseDelayMs * 2 ** (attempt - 1))
      }
    }
  }

  throw new RetryExhaustedError(lastError, totalAttempts)
}
