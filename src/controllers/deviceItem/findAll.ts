import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { findAllDeviceItemSchema } from '../../schemas/deviceItemSchema'
import { DeviceItemService } from '../../services/DeviceItemServices'

export const findAllDeviceItem = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    findAllDeviceItemSchema,
    req.query
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const { page, size, pagination, deviceItemDeviceId } = validatedData
    const result = await DeviceItemService.findAll({
      page,
      size,
      pagination,
      deviceItemDeviceId
    })

    const response = ResponseData.success({ data: result })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
