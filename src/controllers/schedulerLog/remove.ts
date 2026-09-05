import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { SchedulerLogService } from '../../services/scheduler/SchedulerLog.service'
import { type IRemoveSchedulerLog } from '../../schemas/SchedulerLogSchema'

export const removeSchedulerLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IRemoveSchedulerLog
    await SchedulerLogService.remove(payload.schedulerLogId)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Scheduler log deleted successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
