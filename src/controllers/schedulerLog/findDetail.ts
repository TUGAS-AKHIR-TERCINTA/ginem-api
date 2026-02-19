import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { findDetailSchedulerLogSchema } from '../../schemas/schedulerLogSchema'
import { SchedulerLogService } from '../../services/SchedulerLogServices'

export const findDetailSchedulerLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    findDetailSchedulerLogSchema,
    req.params
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const result = await SchedulerLogService.findById(validatedData.schedulerLogId)
    const response = ResponseData.success({ data: result })

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
