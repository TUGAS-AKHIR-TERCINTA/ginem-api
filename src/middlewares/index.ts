import { useAuthorization } from './access'
import { allowAppRoles } from './appRole'
import { corsOrigin } from './cros'
import { loggerMidleWare } from './logger'
import { validate } from './validate'

export const MiddleWares = {
  useAuthorization,
  allowAppRoles,
  loggerMidleWare,
  corsOrigin,
  validate
}
