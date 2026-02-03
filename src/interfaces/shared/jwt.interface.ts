export interface IJwtPayload {
  userId: number
  userEmail: string
  userRole: 'user' | 'admin' 
}
