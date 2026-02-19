import { createAppLog } from './createAppLog'
import { findAllAppLogs } from './findAllAppLogs'

export const AppLogController = {
  create: createAppLog,
  findAll: findAllAppLogs
}
