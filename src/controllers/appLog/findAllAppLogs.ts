import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type FindAllAppLogsInput } from '../../schemas/AppLogSchema'
import { AppLogService } from '../../services/AppLogService'

export const findAllAppLogs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const query = req.query as unknown as FindAllAppLogsInput
    const { page = 1, size = 20, appLogLevel, search, pagination } = query

    const { formatted } = await AppLogService.findAll({
      page,
      size,
      appLogLevel: appLogLevel ?? undefined,
      search: search ?? undefined,
      pagination: pagination ? 'true' : 'false'
    })

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: formatted }))
  } catch (error) {
    return handleError(res, error)
  }
}
