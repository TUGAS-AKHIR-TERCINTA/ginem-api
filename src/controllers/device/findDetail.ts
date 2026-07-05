import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { DeviceService } from '../../services/Device.service'
import { handleError } from '../../utilities/requestHandler'
import { type IFindDetailDevice } from '../../schemas/DeviceSchema'

export const findDetailDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IFindDetailDevice
    const result = await DeviceService.findById(payload.deviceId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
