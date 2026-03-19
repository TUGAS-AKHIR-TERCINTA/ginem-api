import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type UserRegistrationInput } from '../../schemas/AuthSchema'
import { AuthService } from '../../services/Auth.service'

export const userRegister = async (
  req: Request<{}, {}, UserRegistrationInput>,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as UserRegistrationInput

    await AuthService.registerUser(payload)

    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ message: 'Registration successful' }))
  } catch (error) {
    return handleError(res, error)
  }
}
