import jwt from 'jsonwebtoken'
import { appConfigs } from '../configs'
import { IJwtPayload } from '../interfaces/shared/jwt.interface'

export const generateAccessToken = (user: IJwtPayload): any => {
  return jwt.sign(user, appConfigs.secret.jwtToken ?? '')
}

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, appConfigs.secret.jwtToken ?? '')
  } catch {
    return false
  }
}
