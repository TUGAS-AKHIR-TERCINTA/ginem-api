import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { createDeviceItemSchema } from '../../schemas/deviceItemSchema'
import { DeviceItemService } from '../../services/DeviceItemServices'
import logger from '../../logs'

export const createDeviceItem = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    createDeviceItemSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const { jwtPayload: _, ...payload } = validatedData
    const deviceExists = await DeviceItemService.deviceExists(payload.deviceItemDeviceId)
    if (!deviceExists) {
      const message = `Device not found with ID: ${payload.deviceItemDeviceId}`
      logger.warn(message)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }
    await DeviceItemService.create(payload)
    const response = ResponseData.success({})

    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
