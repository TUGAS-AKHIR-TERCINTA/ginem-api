import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../../utilities/response'
import { generateAccessToken } from '../../../utilities/jwt'
import { ValidationError } from 'joi'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../../utilities/requestHandler'
import { UserModel } from '../../../models/userModel'
import logger from '../../../logs'
import { hashPassword } from '../../../utilities/scurePassword'
import { IAdminLoginRequest } from '../../../interfaces/adminAuth.request'
import { adminLoginSchema } from '../../../schemas/auth/adminAuthSchema'

export const administratorLogin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    adminLoginSchema,
    req.body
  ) as {
    error: ValidationError
    value: IAdminLoginRequest
  }

  if (validationError) return handleValidationError(res, validationError)

  const { userEmail, userPassword } = validatedData

  try {
    const user = await UserModel.findOne({
      where: {
        deleted: 0,
        userEmail,
        userRole: 'superAdmin'
      }
    })

    if (user == null) {
      const message = 'Account not found. Please register first!'
      logger.info(`Login Administrator attempt failed: ${message}`)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }

    const isPasswordValid = hashPassword(userPassword) === user.userPassword

    if (!isPasswordValid) {
      const message = 'Invalid whatsapp number and password combination!'
      logger.error(`Login attempt failed: ${message}`)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }

    const token = generateAccessToken({
      userId: user.userId,
      userRole: user.userRole,
      userEmail: user.userEmail
    })
    logger.info(`Administrator ${user.userName} logged in successfully`)

    const payload = {
      accessToken: token,
      refreshToken: ''
    }

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: payload }))
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
