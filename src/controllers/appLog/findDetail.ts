import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { findDetailAppLogSchema } from '../../schemas/appLogSchema'
import { AppLogService } from '../../services/AppLogServices'

export const findDetailAppLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    findDetailAppLogSchema,
    req.params
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const result = await AppLogService.findById(validatedData.logId)
    const response = ResponseData.success({ data: result })

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
