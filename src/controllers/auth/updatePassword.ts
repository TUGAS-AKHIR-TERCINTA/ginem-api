import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AuthService } from '../../services/Auth.service'
import { IUpdateUserPassword } from '../../schemas/AuthSchema'
import { IAuthenticatedRequest } from '../../interfaces/shared/request.interface'

export const updatePassword = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as IUpdateUserPassword
    await AuthService.updateUserPassword(payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Password updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
