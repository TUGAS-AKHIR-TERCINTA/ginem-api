import { createDeviceValue } from './create'
import { findAllDeviceValue } from './findAll'
import { findDetailDeviceValue } from './findDetail'
import { removeDeviceValue } from './remove'
import { updateDeviceValue } from './update'

export const DeviceValueController = {
  findAll: findAllDeviceValue,
  findDetail: findDetailDeviceValue,
  create: createDeviceValue,
  update: updateDeviceValue,
  remove: removeDeviceValue
}
