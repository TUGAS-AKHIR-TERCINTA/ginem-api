import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AppLogService } from '../../services/appLog'
import { type ICreateAppLog } from '../../schemas/AppLogSchema'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'

export const createAppLog = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as ICreateAppLog
    await AppLogService.create(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'App log created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
