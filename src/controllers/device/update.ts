import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { UpdateDeviceSchema } from '../../schemas/DeviceSchema'
import { DeviceService } from '../../services/Device.service'
import { handleError } from '../../utilities/requestHandler'

export const updateDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.body as unknown as UpdateDeviceSchema

  try {
    await DeviceService.update(payload)
    const response = ResponseData.success({ message: 'Device updated successfully' })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
