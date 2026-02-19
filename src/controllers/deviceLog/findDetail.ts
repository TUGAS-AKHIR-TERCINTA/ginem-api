import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { FindDetailDeviceLogSchema } from '../../schemas/DeviceLogSchema'
import { DeviceLogService } from '../../services/DeviceLogServices'

export const findDetailDeviceLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.params as unknown as FindDetailDeviceLogSchema
  try {
    const result = await DeviceLogService.findById(payload.deviceLogId)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}
