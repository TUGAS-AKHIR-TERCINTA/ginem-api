import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type IFindDetailDeviceLog } from '../../schemas/DeviceLogSchema'
import { DeviceLogService } from '../../services/device'

export const findDetailDeviceLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IFindDetailDeviceLog
    const result = await DeviceLogService.findById(payload.deviceLogId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
