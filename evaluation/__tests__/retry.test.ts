import { withRetry, RetryExhaustedError } from '../runner/retry'

describe('withRetry', () => {
  it('returns on the first successful attempt without retrying', async () => {
    const fn = jest.fn().mockResolvedValue('ok')
    const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 1 })

    expect(result).toEqual({ value: 'ok', attempts: 1 })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure and succeeds within the retry budget', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValueOnce('ok')

    const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 1 })

    expect(result).toEqual({ value: 'ok', attempts: 2 })
  })

  it('throws RetryExhaustedError after exceeding maxRetries, preserving the cause', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('down'))

    await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 1 })).rejects.toMatchObject({
      attempts: 3
    })
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('RetryExhaustedError keeps a reference to the original error', async () => {
    const original = new Error('boom')
    const fn = jest.fn().mockRejectedValue(original)

    try {
      await withRetry(fn, { maxRetries: 0, baseDelayMs: 1 })
      fail('expected withRetry to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(RetryExhaustedError)
      expect((err as RetryExhaustedError).cause).toBe(original)
    }
  })
})
