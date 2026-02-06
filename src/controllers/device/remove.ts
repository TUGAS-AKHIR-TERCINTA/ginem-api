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
import { removeDeviceSchema } from '../../schemas/deviceSchema'
import { DeviceService } from '../../services/DeviceServices'

export const removeDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    removeDeviceSchema,
    req.params
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const result = await DeviceService.remove(validatedData.deviceId)

    if (result == null) {
      const message = `Device not found with ID: ${validatedData.deviceId}`
      logger.warn(message)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }

    const response = ResponseData.success({ message: 'Device deleted successfully' })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
