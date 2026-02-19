import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type FindDetailDeviceSchema } from '../../schemas/DeviceSchema'
import { DeviceService } from '../../services/DeviceServices'
import { handleError } from '../../utilities/requestHandler'

export const findDetailDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.params as unknown as FindDetailDeviceSchema

  try {
    const result = await DeviceService.findById(payload.deviceId)
    const response = ResponseData.success({ data: result })

    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
