import { ObjectSchema, ValidationResult } from 'joi'
import { StatusCodes } from 'http-status-codes'
import { Response } from 'express'
import { ResponseData } from './response'
import logger from '../logs'
import { ValidationError } from 'joi'

export const validateRequest = (
  schema: ObjectSchema,
  requestData: Record<string, any>
): ValidationResult => {
  return schema.validate(requestData, { abortEarly: false })
}

export function handleValidationError(res: Response, error: ValidationError) {
  const message = `Invalid request! ${error.details.map((x) => x.message).join(', ')}`
  logger.warn(message)
  const response = ResponseData.error({ message })
  return res.status(StatusCodes.BAD_REQUEST).json(response)
}

export function handleServerError(res: Response, err: unknown) {
  if (err instanceof Error) {
    const message = `Unable to process request!: ${err.message}`
    logger.error(message, { stack: err.stack })
    const response = ResponseData.error({
      message: 'Unable to process request! Error code 1T33'
    })
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response)
  }

  const message = 'Unable to process request! Unknown error'
  logger.error(message)
  const response = ResponseData.error({ message: 'Unable to process request!' })
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response)
}
