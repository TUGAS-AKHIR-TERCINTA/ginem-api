import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { MyProfileController } from '../controllers/myProfile'
import {
  findMyProfileSchema,
  updateMyProfileSchema,
  updateOnboardingSchema
} from '../schemas/MyProfileSchema'

const MyProfileRoute = Router()

MyProfileRoute.use(MiddleWares.useAuthorization)

MyProfileRoute.get(
  '/',
  MiddleWares.validate({ query: findMyProfileSchema }),
  MyProfileController.find
)

MyProfileRoute.patch(
  '/',
  MiddleWares.validate({ body: updateMyProfileSchema }),
  MyProfileController.update
)

MyProfileRoute.patch(
  '/onboardings',
  MiddleWares.validate({ body: updateOnboardingSchema }),
  MyProfileController.updateOnboardingStatus
)

export default MyProfileRoute
