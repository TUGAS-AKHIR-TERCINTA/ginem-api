import { Router } from 'express'
import { authController } from '../controllers/auth'
import {
  adminLoginSchema,
  updatePasswordSchema,
  userLoginSchema,
  userRegistrationSchema
} from '../schemas/AuthSchema'
import { MiddleWares } from '../middlewares'

const AuthRoute = Router()

AuthRoute.post(
  '/login/users',
  MiddleWares.validate({ body: userLoginSchema }),
  authController.userLogin
)

AuthRoute.post(
  '/register/users',
  MiddleWares.validate({ body: userRegistrationSchema }),
  authController.userRegister
)

AuthRoute.post(
  '/login/administrators',
  MiddleWares.validate({ body: adminLoginSchema }),
  authController.administratorLogin
)

AuthRoute.patch(
  '/reset-password',
  MiddleWares.validate({ body: updatePasswordSchema }),
  authController.updatePassword
)

export default AuthRoute
