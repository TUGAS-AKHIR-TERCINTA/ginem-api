import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { DeviceService } from '../../services/Device.service'
import { handleError } from '../../utilities/requestHandler'
import { type IRemoveDevice } from '../../schemas/DeviceSchema'

export const removeDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IRemoveDevice
    await DeviceService.remove(payload.deviceId)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Device deleted successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
