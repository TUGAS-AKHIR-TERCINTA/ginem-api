import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import {
  FindAllSchedulerLogOptions,
  SchedulerLogService
} from '../../services/SchedulerLogServices'
import { handleError } from '../../utilities/requestHandler'

export const findAllSchedulerLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.query as FindAllSchedulerLogOptions

  try {
    const result = await SchedulerLogService.findAll(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}
