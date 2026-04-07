import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type IAdminUserIdParam } from '../../schemas/AdminSchema'
import { AdminService } from '../../services/Admin.service'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'

export const removeAdmin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IAdminUserIdParam
    const requesterId = req.jwtPayload?.userId

    if (requesterId == null) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(ResponseData.error({ message: 'Unauthorized' }))
    }

    await AdminService.remove(payload.userId, requesterId)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Admin deleted successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
