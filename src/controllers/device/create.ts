import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { DeviceService } from '../../services/device'
import { handleError } from '../../utilities/requestHandler'
import { type ICreateDevice } from '../../schemas/DeviceSchema'

export const createDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as ICreateDevice
    await DeviceService.create(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Device created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
