import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type AdminUserIdParam } from '../../schemas/AdminSchema'
import { AdminService } from '../../services/Admin.service'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'

export const findDetailAdmin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params as unknown as AdminUserIdParam
    const data = await AdminService.findById(userId)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data }))
  } catch (err) {
    return handleError(res, err)
  }
}
