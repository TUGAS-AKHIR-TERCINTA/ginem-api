import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import logger from '../../logs'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { updateDeviceSchema } from '../../schemas/deviceSchema'
import { DeviceService } from '../../services/DeviceServices'

export const updateDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    updateDeviceSchema,
    { ...req.body, deviceId: req.params?.deviceId }
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const exists = await DeviceService.exists(validatedData.deviceId)
    if (!exists) {
      const message = `Device not found with ID: ${validatedData.deviceId}`
      logger.warn(message)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }

    await DeviceService.update(validatedData)
    const response = ResponseData.success({ message: 'Device updated successfully' })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
