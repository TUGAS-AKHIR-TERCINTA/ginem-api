import { findAllDeviceLog } from './findAll'
import { findDetailDeviceLog } from './findDetail'
import { createDeviceLog } from './create'
import { updateDeviceLog } from './update'
import { removeDeviceLog } from './remove'

export const DeviceLogController = {
  findAll: findAllDeviceLog,
  findDetail: findDetailDeviceLog,
  create: createDeviceLog,
  update: updateDeviceLog,
  remove: removeDeviceLog
}
