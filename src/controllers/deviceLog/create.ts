import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import {
  CreateDeviceLogPayload,
  DeviceLogService
} from '../../services/DeviceLog.service'

export const createDeviceLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.body as CreateDeviceLogPayload

  try {
    await DeviceLogService.create(payload)
    return res.status(StatusCodes.CREATED).json(ResponseData.success({}))
  } catch (err) {
    return handleError(res, err)
  }
}
