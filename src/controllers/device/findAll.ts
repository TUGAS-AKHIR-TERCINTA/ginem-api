import { query, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type FindAllDeviceSchema } from '../../schemas/DeviceSchema'
import { DeviceService } from '../../services/Device.service'
import { handleError } from '../../utilities/requestHandler'

export const findAllDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const query = req.query as unknown as FindAllDeviceSchema

    const result = await DeviceService.findAll(query)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
