import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { DeviceService } from '../../services/Device.service'
import { handleError } from '../../utilities/requestHandler'
import { IUpdateDevice } from '../../schemas/DeviceSchema'

export const updateDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateDevice
    await DeviceService.update(payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Device updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
