/**
 * Poin 27: respect provider rate limits — never fire every request in parallel
 * uncontrolled. A plain counting semaphore, no new dependency needed.
 */
class Semaphore {
  private active = 0
  private readonly queue: Array<() => void> = []

  constructor(private readonly limit: number) {}

  async acquire(): Promise<() => void> {
    if (this.active < this.limit) {
      this.active += 1
      return () => {
        this.release()
      }
    }
    return await new Promise((resolve) => {
      this.queue.push(() => {
        this.active += 1
        resolve(() => {
          this.release()
        })
      })
    })
  }

  private release(): void {
    this.active -= 1
    const next = this.queue.shift()
    if (next != null) next()
  }
}

/**
 * `shouldStop` is checked before an item starts (both before and after acquiring
 * the semaphore slot) so a pause request (e.g. Ctrl+C) lets already in-flight
 * items finish normally — and get written to disk — while simply not starting
 * any item that hasn't begun yet. Those items are left unrecorded, so a later
 * `--resume` run picks them up naturally; nothing needs to track "was stopped".
 */
export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
  shouldStop?: () => boolean
): Promise<Array<R | undefined>> {
  const semaphore = new Semaphore(Math.max(1, limit))
  const results = new Array<R | undefined>(items.length)

  await Promise.all(
    items.map(async (item, index) => {
      if (shouldStop?.() === true) return
      const release = await semaphore.acquire()
      try {
        if (shouldStop?.() === true) return
        results[index] = await worker(item, index)
      } finally {
        release()
      }
    })
  )

  return results
}
