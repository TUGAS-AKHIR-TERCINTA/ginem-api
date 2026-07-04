import { StatusCodes } from 'http-status-codes'
import { AppError } from '../AppError'

describe('AppError', () => {
  it('creates an error with default internal server status', () => {
    const error = new AppError('Something failed')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error.message).toBe('Something failed')
    expect(error.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
    expect(error.isOperational).toBe(true)
  })

  it('creates an error with custom status code', () => {
    const error = new AppError('Forbidden', StatusCodes.FORBIDDEN, false)

    expect(error.statusCode).toBe(StatusCodes.FORBIDDEN)
    expect(error.isOperational).toBe(false)
  })

  it('creates not found error via factory', () => {
    const error = AppError.notFound('Device not found')

    expect(error.statusCode).toBe(StatusCodes.NOT_FOUND)
    expect(error.message).toBe('Device not found')
  })

  it('creates bad request error via factory', () => {
    const error = AppError.badRequest('Invalid input')

    expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST)
    expect(error.message).toBe('Invalid input')
  })

  it('creates conflict error via factory', () => {
    const error = AppError.conflict('Email already exists')

    expect(error.statusCode).toBe(StatusCodes.CONFLICT)
    expect(error.message).toBe('Email already exists')
  })
})
