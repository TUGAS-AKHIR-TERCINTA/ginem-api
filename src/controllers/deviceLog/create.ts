import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { DeviceLogService } from '../../services/device'
import { type ICreateDeviceLog } from '../../schemas/DeviceLogSchema'

export const createDeviceLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as ICreateDeviceLog
    await DeviceLogService.create(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Device log created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
