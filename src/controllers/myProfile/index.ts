import { findMyProfile } from './find'
import { updateOnboardingStatus } from './onboarding'
import { updateMyProfile } from './update'

export const MyProfileController = {
  find: findMyProfile,
  update: updateMyProfile,
  updateOnboardingStatus
}
