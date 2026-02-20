import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { FindDetailSchedulerLogSchema } from '../../schemas/schedulerLogSchema'
import { SchedulerLogService } from '../../services/SchedulerLogServices'
import { handleError } from '../../utilities/requestHandler'

export const findDetailSchedulerLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.params as unknown as FindDetailSchedulerLogSchema

  try {
    const result = await SchedulerLogService.findById(payload.schedulerLogId)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}
