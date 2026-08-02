import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { DeviceLogService } from '../../services/device'
import { type IRemoveDeviceLog } from '../../schemas/DeviceLogSchema'

export const removeDeviceLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IRemoveDeviceLog
    await DeviceLogService.remove(payload.deviceLogId)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Device log deleted successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
