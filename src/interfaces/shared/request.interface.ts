import { type Request } from 'express'
import { type IJwtPayload } from './jwt.interface'

export interface IAuthenticatedRequest extends Request {
  jwtPayload?: IJwtPayload
}
