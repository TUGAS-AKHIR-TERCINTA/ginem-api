import { useAuthorization } from './access'
import { allowAppRoles } from './appRole'
import { corsOrigin } from './cros'
import { loggerMidleWare } from './logger'

export const MiddleWares = {
  useAuthorization,
  allowAppRoles,
  loggerMidleWare,
  corsOrigin
}
