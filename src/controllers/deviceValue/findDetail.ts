import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { findDetailDeviceValueSchema } from '../../schemas/DeviceValueSchema'
import { DeviceValueService } from '../../services/DeviceLogServices'

export const findDetailDeviceValue = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    findDetailDeviceValueSchema,
    req.params
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const result = await DeviceValueService.findById(validatedData.deviceValueId)
    const response = ResponseData.success({ data: result })

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
