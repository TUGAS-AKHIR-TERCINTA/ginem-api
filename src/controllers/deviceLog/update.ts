import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { UpdateDeviceLogSchema } from '../../schemas/DeviceLogSchema'
import { DeviceLogService } from '../../services/DeviceLogServices'

export const updateDeviceLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.body as unknown as UpdateDeviceLogSchema

  try {
    await DeviceLogService.update(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Device log updated successfully' }))
  } catch (err) {
    return handleError(res, err)
  }
}
