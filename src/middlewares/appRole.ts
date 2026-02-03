import { type RequestHandler } from 'express'
import { ResponseData } from '../utilities/response'
import { StatusCodes } from 'http-status-codes'
import { IAuthenticatedRequest } from '../interfaces/shared/request.interface'

export type Role = 'user' | 'admin' | 'superAdmin'

export function allowAppRoles(...roles: Role[]): RequestHandler {
  return (req: IAuthenticatedRequest, res, next) => {
    if (!req.jwtPayload) {
      const message = 'Unauthorized! Mising Token'
      const response = ResponseData.error({ message })

      return res.status(StatusCodes.UNAUTHORIZED).json(response)
    }

    const user = req?.jwtPayload

    if (!user) {
      const message = 'Unauthorized! unknown user'
      const response = ResponseData.error({ message })
      return res.status(StatusCodes.UNAUTHORIZED).json(response)
    }

    if (!roles.includes(user.userRole)) {
      const message = 'Forbidden: Insufficient role'
      const response = ResponseData.error({ message })
      return res.status(StatusCodes.UNAUTHORIZED).json(response)
    }
    next()
  }
}
