import { type RequestHandler } from 'express'
import { ResponseData } from '../utilities/response'
import { StatusCodes } from 'http-status-codes'
import { type IAuthenticatedRequest } from '../interfaces/shared/request.interface'

export type Role = 'user' | 'admin' | 'superAdmin'

export function allowAppRoles(...roles: Role[]): RequestHandler {
  return (req: IAuthenticatedRequest, res, next) => {
    if (req.jwtPayload == null) {
      const message = 'Unauthorized! Mising Token'
      const response = ResponseData.error({ message })

      return res.status(StatusCodes.UNAUTHORIZED).json(response)
    }

    const userRole = req.jwtPayload.userRole
    if (userRole == null) {
      const message = 'Unauthorized! unknown user'
      const response = ResponseData.error({ message })
      return res.status(StatusCodes.UNAUTHORIZED).json(response)
    }

    if (!roles.includes(userRole as Role)) {
      const message = 'Forbidden: Insufficient role'
      const response = ResponseData.error({ message })
      return res.status(StatusCodes.UNAUTHORIZED).json(response)
    }
    next()
  }
}
