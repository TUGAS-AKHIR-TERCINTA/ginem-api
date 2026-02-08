import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { findDetailDeviceItemSchema } from '../../schemas/deviceItemSchema'
import { DeviceItemService } from '../../services/DeviceItemServices'

export const findDetailDeviceItem = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    findDetailDeviceItemSchema,
    req.params
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const result = await DeviceItemService.findById(validatedData.deviceItemId)
    const response = ResponseData.success({ data: result })

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
