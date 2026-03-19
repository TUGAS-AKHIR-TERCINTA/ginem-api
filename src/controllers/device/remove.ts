import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type RemoveDeviceSchema } from '../../schemas/DeviceSchema'
import { DeviceService } from '../../services/Device.service'
import { handleError } from '../../utilities/requestHandler'

export const removeDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.params as unknown as RemoveDeviceSchema

  try {
    await DeviceService.remove(payload.deviceId)

    const response = ResponseData.success({ message: 'Device deleted successfully' })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
