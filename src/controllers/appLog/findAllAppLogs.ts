import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AppLogService } from '../../services/AppLog.service'
import { IFindAllAppLogs } from '../../schemas/AppLogSchema'
import { IAuthenticatedRequest } from '../../interfaces/shared/request.interface'

export const findAllAppLogs = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllAppLogs
    const result = await AppLogService.findAll(payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
