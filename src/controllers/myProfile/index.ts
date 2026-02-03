import { findMyProfile } from './find'
import { updateOnboardingStatus } from './onboarding'
import { updateMyProfile } from './update'

export const myProfileController = {
  find: findMyProfile,
  update: updateMyProfile,
  updateOnboardingStatus
}
