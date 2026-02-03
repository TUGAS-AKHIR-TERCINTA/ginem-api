import { type Request } from 'express'
import { IJwtPayload } from './jwt.interface'

export interface IAuthenticatedRequest extends Request {
  jwtPayload?: IJwtPayload
}
