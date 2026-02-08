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
import { updateDeviceItemSchema } from '../../schemas/deviceItemSchema'
import { DeviceItemService } from '../../services/DeviceItemServices'

export const updateDeviceItem = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    updateDeviceItemSchema,
    { ...req.body, deviceItemId: req.params?.deviceItemId }
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const exists = await DeviceItemService.exists(validatedData.deviceItemId)
    if (!exists) {
      const message = `Device item not found with ID: ${validatedData.deviceItemId}`
      logger.warn(message)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }
    if (validatedData.deviceItemDeviceId != null) {
      const deviceExists = await DeviceItemService.deviceExists(validatedData.deviceItemDeviceId)
      if (!deviceExists) {
        const message = `Device not found with ID: ${validatedData.deviceItemDeviceId}`
        logger.warn(message)
        return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
      }
    }
    await DeviceItemService.update(validatedData)
    const response = ResponseData.success({ message: 'Device item updated successfully' })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
