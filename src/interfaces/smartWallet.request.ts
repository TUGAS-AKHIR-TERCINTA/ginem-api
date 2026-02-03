import { IJwtPayload } from './shared/jwt.interface'
import { IPaginationRequest } from './shared/paginationRequest.interface'

export interface ISmartWalletFindAllRequest extends IPaginationRequest {
  jwtPayload: IJwtPayload
  smartWalletId: number
}

export interface ISmartWalletFindDetailRequest {
  jwtPayload: IJwtPayload
  smartWalletId: number
}

export interface ISmartWalletRemoveRequest extends ISmartWalletFindDetailRequest {
  jwtPayload: IJwtPayload
}

export interface ISmartWalletUpdateRequest {
  jwtPayload: IJwtPayload
}
