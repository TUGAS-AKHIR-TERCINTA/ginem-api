import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type ICreateAdmin } from '../../schemas/AdminSchema'
import { AdminService } from '../../services/Admin.service'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'

export const createAdmin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ICreateAdmin

    await AdminService.create(payload)
    const response = ResponseData.success({ message: 'Admin created successfully' })
    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
