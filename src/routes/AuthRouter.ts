import { Router } from 'express'
import { authController } from '../controllers/auth/index'
import {
  updatePasswordSchema,
  userLoginSchema,
  userRegistrationSchema
} from '../schemas/AuthSchema'
import { MiddleWares } from '../middlewares/index'

const AuthRoute = Router()

AuthRoute.post(
  '/login',
  MiddleWares.validate({ body: userLoginSchema }),
  authController.userLogin
)

AuthRoute.post(
  '/register',
  MiddleWares.validate({ body: userRegistrationSchema }),
  authController.userRegister
)

AuthRoute.patch(
  '/reset-password',
  MiddleWares.validate({ body: updatePasswordSchema }),
  authController.updatePassword
)

export default AuthRoute
