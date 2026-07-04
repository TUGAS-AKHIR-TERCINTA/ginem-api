import { query, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { DeviceService } from '../../services/Device.service'
import { handleError } from '../../utilities/requestHandler'
import { IFindAllDevice } from '../../schemas/DeviceSchema'

export const findAllDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllDevice
    const result = await DeviceService.findAll(payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
