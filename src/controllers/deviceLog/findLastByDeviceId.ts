import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { DeviceLogService } from '../../services/DeviceLog.service'
import { type IFindLastLatestDeviceLogByDeviceId } from '../../schemas/DeviceLogSchema'

export const findLastDeviceLogByDeviceId = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IFindLastLatestDeviceLogByDeviceId
    const result = await DeviceLogService.getLastLogByDeviceId(payload.deviceId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
