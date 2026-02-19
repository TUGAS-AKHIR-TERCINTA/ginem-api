import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { AuthService } from '../../services/AuthService'
import { type UserLoginInput } from '../../schemas/AuthSchema'

export const userLogin = async (
  req: Request<{}, {}, UserLoginInput>,
  res: Response
): Promise<Response> => {
  try {
    const payload = await AuthService.loginUser(req.body)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: payload }))
  } catch (error) {
    return handleError(res, error)
  }
}
