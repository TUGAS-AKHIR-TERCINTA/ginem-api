import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type FindAllAdminQuery } from '../../schemas/AdminSchema'
import { AdminService } from '../../services/Admin.service'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'

export const findAllAdmins = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const query = req.query as unknown as FindAllAdminQuery
    const result = await AdminService.findAll(query)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}
