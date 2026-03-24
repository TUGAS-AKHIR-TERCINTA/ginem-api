import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type FindLastLatestDeviceLogByDeviceIdSchema } from '../../schemas/DeviceLogSchema'
import { DeviceLogService } from '../../services/DeviceLog.service'
import { AppError } from '../../utilities/AppError'

export const findLatestDeviceLogByDeviceId = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.params as unknown as FindLastLatestDeviceLogByDeviceIdSchema

  try {
    const result = await DeviceLogService.getLatestLogByDeviceId(payload.deviceId)
    if (result == null) {
      throw AppError.notFound('Device log not found')
    }

    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        data: {
          deviceLogId: result.deviceLogId,
          deviceLogDeviceId: payload.deviceId,
          deviceLogData: result.deviceLogData,
          createdAt: result.createdAt
        }
      })
    )
  } catch (err) {
    return handleError(res, err)
  }
}
