import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type UpdateAdminBody } from '../../schemas/AdminSchema'
import { AdminService } from '../../services/Admin.service'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'

export const updateAdmin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as UpdateAdminBody
    await AdminService.update(payload)
    const response = ResponseData.success({ message: 'Admin updated successfully' })
    return res.status(StatusCodes.OK).json(response)
  } catch (err) {
    return handleError(res, err)
  }
}
