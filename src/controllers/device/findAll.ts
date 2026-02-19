import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type FindAllDeviceSchema } from '../../schemas/DeviceSchema'
import { DeviceService } from '../../services/DeviceServices'
import { handleError } from '../../utilities/requestHandler'

export const findAllDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { page, size, pagination, search } = req.query as FindAllDeviceSchema

    const result = await DeviceService.findAll({
      page,
      size,
      pagination,
      search
    })

    const response = ResponseData.success({ data: result })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
