import { Router } from 'express'
import { myProfileController } from '../controllers/myProfile'
import { MiddleWares } from '../middlewares'

const MyProfileRoute = Router()

MyProfileRoute.use(MiddleWares.useAuthorization)
MyProfileRoute.get('/', myProfileController.find)

MyProfileRoute.patch('/', MiddleWares.useAuthorization, myProfileController.update)

MyProfileRoute.patch(
  '/onboardings',
  MiddleWares.useAuthorization,
  MiddleWares.allowAppRoles('admin'),
  myProfileController.updateOnboardingStatus
)

export default MyProfileRoute
