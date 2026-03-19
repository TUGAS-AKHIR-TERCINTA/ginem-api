import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import {
  DeviceLogService,
  FindAllDeviceLogOptions
} from '../../services/DeviceLog.service'

export const findAllDeviceLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as FindAllDeviceLogOptions

    const result = await DeviceLogService.findAll(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}
