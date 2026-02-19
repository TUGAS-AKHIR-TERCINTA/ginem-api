import Transport from 'winston-transport'
import type { Model } from 'sequelize'

interface DatabaseTransportOptions extends Transport.TransportStreamOptions {
  model: Model
}

/**
 * Winston transport that persists log entries to the database.
 * Use createDatabaseTransport(AppLogModel) and add to logger.
 */
export class DatabaseTransport extends Transport {
  private model: Model

  constructor(opts: DatabaseTransportOptions) {
    super(opts)
    this.model = opts.model
  }

  log(info: Record<string, unknown>, callback: () => void): void {
    setImmediate(() => {
      this.emit('logged', info)
    })

    const level = String(info.level ?? 'info')
    const message =
      typeof info.message === 'string' ? info.message : JSON.stringify(info.message)
    const meta = info.meta ?? (info.stack ? { stack: info.stack } : null)
    const stack = typeof info.stack === 'string' ? info.stack : null

    void (this.model as any)
      .create({
        level,
        message,
        meta: meta && typeof meta === 'object' ? meta : undefined,
        stack
      })
      .then(() => callback())
      .catch(() => callback())
  }
}

export function createDatabaseTransport(model: Model): DatabaseTransport {
  return new DatabaseTransport({ model })
}
