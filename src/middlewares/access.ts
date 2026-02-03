import { type NextFunction, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../utilities/response'
import { verifyAccessToken } from '../utilities/jwt'
import { handleServerError } from '../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../interfaces/shared/request.interface'

export const useAuthorization = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): any => {
  try {
    if (
      req.headers.authorization == null ||
      !req.headers.authorization.startsWith('Bearer ')
    ) {
      const message = 'Missing Authorization.'
      const response = ResponseData.error({ message })
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const token = req.headers.authorization.split(' ')[1]
    const verify = verifyAccessToken(token)

    if (!verify) {
      const message = 'Invalid Authorization.'
      const response = ResponseData.error({ message })
      return res.status(StatusCodes.UNAUTHORIZED).json(response)
    }

    req.jwtPayload = verify

    next()
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
