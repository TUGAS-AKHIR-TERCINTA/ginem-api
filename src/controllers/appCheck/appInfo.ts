import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleServerError } from '../../utilities/requestHandler'
import { IAuthenticatedRequest } from '../../interfaces/shared/request.interface'


export const appInfo = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {

    const data = {
      isMaintenance: false,
      maintenanceMessage: ''
    }

    const response = ResponseData.success({ data })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
