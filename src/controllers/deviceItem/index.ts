import { createDeviceItem } from './create'
import { findAllDeviceItem } from './findAll'
import { findDetailDeviceItem } from './findDetail'
import { removeDeviceItem } from './remove'
import { updateDeviceItem } from './update'

export const DeviceItemController = {
  findAll: findAllDeviceItem,
  findDetail: findDetailDeviceItem,
  create: createDeviceItem,
  update: updateDeviceItem,
  remove: removeDeviceItem
}
