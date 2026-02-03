import { createLogger, format, transports } from 'winston'
import path from 'path'

const logFilePath = path.join(__dirname, 'logs', 'app.log')
const errorLogFilePath = path.join(__dirname, 'logs', 'error.log')

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

export default logger
