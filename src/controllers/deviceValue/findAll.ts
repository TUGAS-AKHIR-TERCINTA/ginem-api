import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { findAllDeviceValueSchema } from '../../schemas/DeviceValueSchema'
import { DeviceValueService } from '../../services/DeviceLogServices'

export const findAllDeviceValue = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    findAllDeviceValueSchema,
    req.query
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const { page, size, pagination, deviceValueDeviceId } = validatedData
    const result = await DeviceValueService.findAll({
      page,
      size,
      pagination,
      deviceValueDeviceId
    })

    const response = ResponseData.success({ data: result })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
