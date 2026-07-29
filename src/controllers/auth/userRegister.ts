import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IUserRegistration } from '../../schemas/AuthSchema'
import { AuthService } from '../../services/auth'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'

export const userRegister = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as IUserRegistration
    await AuthService.registerUser(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Registration successful' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
