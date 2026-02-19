import { StatusCodes } from 'http-status-codes'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    isOperational = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Object.setPrototypeOf(this, AppError.prototype)
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  static notFound(message: string): AppError {
    return new AppError(message, StatusCodes.NOT_FOUND)
  }

  static badRequest(message: string): AppError {
    return new AppError(message, StatusCodes.BAD_REQUEST)
  }

  static conflict(message: string): AppError {
    return new AppError(message, StatusCodes.CONFLICT)
  }
}
