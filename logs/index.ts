import { createLogger, format, transports } from 'winston'
import path from 'path'
import { createDatabaseTransport } from '../src/logs/databaseTransport'

const logFilePath = path.join(__dirname, '.', 'app.log')
const errorLogFilePath = path.join(__dirname, '.', 'error.log')

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'backend-service' },
  transports: [
    new transports.File({ filename: logFilePath, level: 'info' }),
    new transports.File({ filename: errorLogFilePath, level: 'error' }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  ]
})

let databaseTransportRegistered = false

/**
 * Register database transport so all logs (error, warn, info, etc.) are also stored in the database.
 * Call once at app startup after sequelize is ready (e.g. in server.ts).
 */
export function registerDatabaseTransport(model: any): void {
  if (databaseTransportRegistered) return
  logger.add(createDatabaseTransport(model))
  databaseTransportRegistered = true
}

export default logger
