import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { createDeviceSchema } from '../../schemas/deviceSchema'
import { DeviceService } from '../../services/DeviceServices'
import { v4 as uuidv4 } from 'uuid'

export const createDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    createDeviceSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const { jwtPayload: _, ...payload } = validatedData
    const deviceToken = `fck_${uuidv4()}`
    payload.deviceToken = deviceToken
    await DeviceService.create(payload)

    const response = ResponseData.success({})

    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
