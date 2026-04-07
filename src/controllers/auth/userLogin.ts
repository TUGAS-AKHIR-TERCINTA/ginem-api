import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AuthService } from '../../services/Auth.service'
import { IUserLogin } from '../../schemas/AuthSchema'
import { IAuthenticatedRequest } from '../../interfaces/shared/request.interface'

export const userLogin = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as IUserLogin
    const result = await AuthService.loginUser(payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
