import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { RemoveDeviceLogSchema } from '../../schemas/DeviceLogSchema'
import { DeviceLogService } from '../../services/DeviceLog.service'

export const removeDeviceLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.params as unknown as RemoveDeviceLogSchema
  try {
    await DeviceLogService.remove(payload.deviceLogId)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Device log deleted successfully' }))
  } catch (err) {
    return handleError(res, err)
  }
}
