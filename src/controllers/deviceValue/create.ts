import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { createDeviceValueSchema } from '../../schemas/deviceValueSchema'
import { DeviceValueService } from '../../services/DeviceValueServices'

export const createDeviceValue = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    createDeviceValueSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const { jwtPayload: _, ...payload } = validatedData
    const deviceExists = await DeviceValueService.deviceExists(
      payload.deviceValueDeviceId
    )
    if (!deviceExists) {
      const message = `Device not found with ID: ${payload.deviceValueDeviceId}`
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }
    await DeviceValueService.create(payload)
    const response = ResponseData.success({})

    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
