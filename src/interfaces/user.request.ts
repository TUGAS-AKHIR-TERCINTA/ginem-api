import { IJwtPayload } from './shared/jwt.interface'
import { IPaginationRequest } from './shared/paginationRequest.interface'

export interface IUserUpdateRequest {
  userId: number
  userName: string
  userPassword: string
  userEmail: string
  userRole: 'admin' | 'superAdmin' | 'user'
  userOnboardingStatus?: 'waiting' | 'completed'
}

export interface IUserFindAllRequest extends IPaginationRequest {
  userRole: 'admin' | 'superAdmin' | 'user'
}

export interface IUserFindDetailRequest {
  userId: number
}

export interface IUserRemoveRequest extends IUserFindDetailRequest {}

export interface IMyProfile {
  jwtPayload: IJwtPayload
  userId: number
  userName: string
  userPassword: string
  userEmail: string
  userDeviceId: string
}
