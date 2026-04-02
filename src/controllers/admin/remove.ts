import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type AdminUserIdParam } from '../../schemas/AdminSchema'
import { AdminService } from '../../services/Admin.service'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'

export const removeAdmin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params as unknown as AdminUserIdParam
    const requesterId = req.jwtPayload?.userId
    if (requesterId == null) {
      const response = ResponseData.error({ message: 'Unauthorized' })
      return res.status(StatusCodes.UNAUTHORIZED).json(response)
    }

    await AdminService.remove(userId, requesterId)
    const response = ResponseData.success({ message: 'Admin deleted successfully' })
    return res.status(StatusCodes.OK).json(response)
  } catch (err) {
    return handleError(res, err)
  }
}
