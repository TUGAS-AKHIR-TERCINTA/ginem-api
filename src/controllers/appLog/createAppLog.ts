import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type CreateAppLogInput } from '../../schemas/AppLogSchema'
import { AppLogService } from '../../services/AppLog.service'

export const createAppLog = async (
  req: Request<{}, {}, CreateAppLogInput>,
  res: Response
): Promise<Response> => {
  try {
    const { appLogLevel, appLogMessage, appLogSource, appLogMeta } = req.body

    const record = await AppLogService.create({
      appLogLevel,
      appLogMessage,
      appLogSource: appLogSource ?? null,
      appLogMeta: appLogMeta ?? null
    })

    return res.status(StatusCodes.CREATED).json(
      ResponseData.success({
        data: record,
        message: 'AppLog created successfully'
      })
    )
  } catch (error) {
    return handleError(res, error)
  }
}
