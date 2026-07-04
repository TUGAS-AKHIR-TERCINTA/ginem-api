import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { DeviceLogService } from '../../services/DeviceLog.service'
import { type IUpdateDeviceLog } from '../../schemas/DeviceLogSchema'

export const updateDeviceLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as IUpdateDeviceLog
    await DeviceLogService.update(payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Device log updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
