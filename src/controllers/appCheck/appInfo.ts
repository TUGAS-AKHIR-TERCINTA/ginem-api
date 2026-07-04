import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared/request.interface'

export const appInfo = async (
  _req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const data = {
      isMaintenance: false,
      maintenanceMessage: ''
    }

    return res.status(StatusCodes.OK).json(ResponseData.success({ data }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
