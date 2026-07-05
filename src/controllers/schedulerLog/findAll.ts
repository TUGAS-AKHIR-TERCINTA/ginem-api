import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { SchedulerLogService } from '../../services/SchedulerLog.service'
import { handleError } from '../../utilities/requestHandler'
import { type IFindAllSchedulerLog } from '../../schemas/SchedulerLogSchema'

export const findAllSchedulerLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllSchedulerLog
    const result = await SchedulerLogService.findAll(payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
