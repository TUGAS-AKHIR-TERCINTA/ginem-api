import { administratorLogin } from './administrator/login'
import { updatePassword } from './updatePassword'
import { userLogin } from './user/login'
import { userRegister } from './user/register'

export const authController = {
  administratorLogin,
  updatePassword,
  userLogin,
  userRegister
}
