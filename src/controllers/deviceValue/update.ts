import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import logger from '../../../logs'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { updateDeviceValueSchema } from '../../schemas/deviceValueSchema'
import { DeviceValueService } from '../../services/DeviceValueServices'

export const updateDeviceValue = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    updateDeviceValueSchema,
    { ...req.body, deviceValueId: req.params?.deviceValueId }
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const exists = await DeviceValueService.exists(validatedData.deviceValueId)
    if (!exists) {
      const message = `Device value not found with ID: ${validatedData.deviceValueId}`
      logger.warn(message)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }
    if (validatedData.deviceValueDeviceId != null) {
      const deviceExists = await DeviceValueService.deviceExists(
        validatedData.deviceValueDeviceId
      )
      if (!deviceExists) {
        const message = `Device not found with ID: ${validatedData.deviceValueDeviceId}`
        logger.warn(message)
        return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
      }
    }
    await DeviceValueService.update(validatedData)
    const response = ResponseData.success({
      message: 'Device value updated successfully'
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
