export interface IAdminRegisterRequest {
  userId: number
  userName: string
  userPassword: string
  userEmail: string
  userRole: 'admin' |  'user'
}

export interface IAdminLoginRequest {
  userPassword: string
  userEmail: string
  userDeviceId?: string
}
