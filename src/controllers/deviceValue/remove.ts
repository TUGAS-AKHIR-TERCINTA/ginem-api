import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { removeDeviceValueSchema } from '../../schemas/DeviceValueSchema'
import { DeviceValueService } from '../../services/DeviceLogServices'

export const removeDeviceValue = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    removeDeviceValueSchema,
    req.params
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const result = await DeviceValueService.remove(validatedData.deviceValueId)

    if (result == null) {
      const message = `Device value not found with ID: ${validatedData.deviceValueId}`
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }

    const response = ResponseData.success({
      message: 'Device value deleted successfully'
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
