import { findAllSchedulerLog } from './findAll'
import { findDetailSchedulerLog } from './findDetail'
import { removeSchedulerLog } from './remove'

export const SchedulerLogController = {
  findAll: findAllSchedulerLog,
  findDetail: findDetailSchedulerLog,
  remove: removeSchedulerLog
}
