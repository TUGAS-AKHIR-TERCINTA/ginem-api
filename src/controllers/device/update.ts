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
import { DeviceModel } from '../../models/DeviceModel'

export const updateDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    updateDeviceSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)
  try {
    const existingDevice = await DeviceModel.findOne({
      where: {
        deleted: 0,
        deviceId: validatedData.deviceId
      }
    })

    if (existingDevice === null) {
      const message = `Device not found with ID: ${validatedData.deviceId}`
      logger.warn(message)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }

    await DeviceModel.update(validatedData, {
      where: { deleted: 0, deviceId: validatedData.deviceId }
    })

    const response = ResponseData.success({ message: 'Device updated successfully' })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
