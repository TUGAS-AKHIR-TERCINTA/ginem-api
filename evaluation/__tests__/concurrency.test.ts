import { runWithConcurrency } from '../runner/concurrency'

describe('runWithConcurrency', () => {
  it('runs every item and returns results in the original order', async () => {
    const items = [3, 1, 2]
    const results = await runWithConcurrency(items, 2, async (n) => {
      await new Promise((resolve) => setTimeout(resolve, n))
      return n * 10
    })

    expect(results).toEqual([30, 10, 20])
  })

  it('never exceeds the configured concurrency limit', async () => {
    let active = 0
    let maxActive = 0
    const items = Array.from({ length: 10 }, (_, i) => i)

    await runWithConcurrency(items, 3, async () => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, 5))
      active -= 1
    })

    expect(maxActive).toBeLessThanOrEqual(3)
  })

  it('propagates a worker error', async () => {
    await expect(
      runWithConcurrency([1, 2], 2, async (n) => {
        if (n === 2) throw new Error('boom')
        return n
      })
    ).rejects.toThrow('boom')
  })

  it('lets an already-started item finish but starts no new ones once shouldStop is true (pause/resume support)', async () => {
    const started: number[] = []
    const items = [1, 2, 3, 4, 5]
    let stop = false

    const results = await runWithConcurrency(
      items,
      1, // concurrency 1 so "already started" vs "not yet started" is unambiguous
      async (n) => {
        started.push(n)
        if (n === 2) stop = true // simulate Ctrl+C firing mid-run, after item 2 begins
        await new Promise((resolve) => setTimeout(resolve, 5))
        return n * 10
      },
      () => stop
    )

    expect(started).toEqual([1, 2])
    expect(results).toEqual([10, 20, undefined, undefined, undefined])
  })
})
