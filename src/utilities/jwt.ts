import jwt from 'jsonwebtoken'
import { appConfigs } from '../configs/appConfig'
import { type IJwtPayload } from '../interfaces/shared/jwt.interface'

export const generateAccessToken = (user: IJwtPayload): string => {
  return jwt.sign(user, appConfigs.secret.jwtToken ?? '')
}

export const verifyAccessToken = (token: string): IJwtPayload | false => {
  try {
    const decoded = jwt.verify(token, appConfigs.secret.jwtToken ?? '')
    if (typeof decoded === 'string') {
      return false
    }
    return decoded as IJwtPayload
  } catch {
    return false
  }
}
