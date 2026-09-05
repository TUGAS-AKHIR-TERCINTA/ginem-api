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

export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const semaphore = new Semaphore(Math.max(1, limit))
  const results: R[] = new Array(items.length)

  await Promise.all(
    items.map(async (item, index) => {
      const release = await semaphore.acquire()
      try {
        results[index] = await worker(item, index)
      } finally {
        release()
      }
    })
  )

  return results
}
