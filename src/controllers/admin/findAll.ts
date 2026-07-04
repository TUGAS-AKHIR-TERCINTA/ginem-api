import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type IFindAllAdmin } from '../../schemas/AdminSchema'
import { AdminService } from '../../services/Admin.service'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'

export const findAllAdmins = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllAdmin

    const result = await AdminService.findAll(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
