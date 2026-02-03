import { Router } from 'express'
import { authController } from '../controllers/auth'

const AuthRoute = Router()

AuthRoute.post('/login/users', authController.userLogin)
AuthRoute.post('/register/users', authController.userRegister)

AuthRoute.post('/login/administrators', authController.administratorLogin)
AuthRoute.patch('/reset-password', authController.updatePassword)

export default AuthRoute
