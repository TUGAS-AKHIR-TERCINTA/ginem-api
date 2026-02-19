import { StatusCodes } from 'http-status-codes'
import { Response } from 'express'
import { ResponseData } from './response'
import logger from '../../logs'
import { AppError } from '../errors/AppError'
import { AppLogService } from '../services/AppLogService'

export function handleServerError(res: Response, err: unknown) {
  if (err instanceof Error) {
    const message = `Unable to process request!: ${err.message}`
    logger.error(message, { stack: err.stack })
    AppLogService.create({
      appLogLevel: 'error',
      appLogMessage: message,
      appLogSource: 'handleServerError',
      appLogMeta: err.stack ?? null
    }).catch(() => {})
    const response = ResponseData.error({
      message: 'Unable to process request! Error code 1T33'
    })
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response)
  }

  const message = 'Unable to process request! Unknown error'
  logger.error(message)
  AppLogService.create({
    appLogLevel: 'error',
    appLogMessage: message,
    appLogSource: 'handleServerError',
    appLogMeta: null
  }).catch(() => {})
  const response = ResponseData.error({ message: 'Unable to process request!' })
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response)
}

/**
 * Handles errors and returns appropriate HTTP status.
 * Use for controllers: AppError -> its statusCode, other errors -> 500.
 */
export function handleError(res: Response, err: unknown): Response {
  if (err instanceof AppError) {
    logger.warn(`[AppError] ${err.statusCode}: ${err.message}`)
    return res.status(err.statusCode).json(ResponseData.error({ message: err.message }))
  }
  return handleServerError(res, err)
}
