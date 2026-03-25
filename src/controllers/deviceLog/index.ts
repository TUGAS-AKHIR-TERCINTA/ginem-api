import { findAllDeviceLog } from './findAll'
import { findDetailDeviceLog } from './findDetail'
import { findLastDeviceLogByDeviceId } from './findLastByDeviceId'
import { findLatestDeviceLogByDeviceId } from './findLatestByDeviceId'
import { createDeviceLog } from './create'
import { updateDeviceLog } from './update'
import { removeDeviceLog } from './remove'

export const DeviceLogController = {
  findAll: findAllDeviceLog,
  findDetail: findDetailDeviceLog,
  findLast: findLastDeviceLogByDeviceId,
  findLatest: findLatestDeviceLogByDeviceId,
  create: createDeviceLog,
  update: updateDeviceLog,
  remove: removeDeviceLog
}
