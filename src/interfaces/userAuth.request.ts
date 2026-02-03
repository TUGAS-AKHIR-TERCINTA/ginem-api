export interface IUserRegisterRequest {
  userId: number
  userName: string
  userPassword: string
  userEmail: string
  userRole: 'admin' | 'user'
}

export interface IUserLoginRequest {
  userPassword: string
  userEmail: string
}
