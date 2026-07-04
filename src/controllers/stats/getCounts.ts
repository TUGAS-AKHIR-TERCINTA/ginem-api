import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { StatsService } from '../../services/Stats.service'
import { handleError } from '../../utilities/requestHandler'

export const getCounts = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const result = await StatsService.getCounts()
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
