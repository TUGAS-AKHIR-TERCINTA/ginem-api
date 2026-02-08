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
import { removeDeviceItemSchema } from '../../schemas/deviceItemSchema'
import { DeviceItemService } from '../../services/DeviceItemServices'

export const removeDeviceItem = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    removeDeviceItemSchema,
    req.params
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const result = await DeviceItemService.remove(validatedData.deviceItemId)

    if (result == null) {
      const message = `Device item not found with ID: ${validatedData.deviceItemId}`
      logger.warn(message)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }

    const response = ResponseData.success({ message: 'Device item deleted successfully' })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
