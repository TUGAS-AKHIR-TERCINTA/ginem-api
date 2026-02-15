import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { findAllAppLogSchema } from '../../schemas/appLogSchema'
import { AppLogService } from '../../services/AppLogServices'

export const findAllAppLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    findAllAppLogSchema,
    req.query
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const { page, size, pagination, level, dateFrom, dateTo } = validatedData
    const result = await AppLogService.findAll({
      page,
      size,
      pagination,
      level,
      dateFrom,
      dateTo
    })

    const response = ResponseData.success({ data: result })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
