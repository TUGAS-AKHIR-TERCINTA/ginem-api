import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type FindAllAppLogsInput } from '../../schemas/AppLogSchema'
import { AppLogService } from '../../services/AppLog.service'

export const findAllAppLogs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const query = req.query as unknown as FindAllAppLogsInput

    const result = await AppLogService.findAll(query)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (error) {
    return handleError(res, error)
  }
}
