import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { SchedulerLogService } from '../../services/scheduler/SchedulerLog.service'
import { handleError } from '../../utilities/requestHandler'
import { type IFindDetailSchedulerLog } from '../../schemas/SchedulerLogSchema'

export const findDetailSchedulerLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IFindDetailSchedulerLog
    const result = await SchedulerLogService.findById(payload.schedulerLogId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
