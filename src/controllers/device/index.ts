import { createDevice } from './create'
import { findAllDevice } from './findAll'
import { findDetailDevice } from './findDetail'
import { removeDevice } from './remove'
import { updateDevice } from './update'

export const DeviceController = {
  findAll: findAllDevice,
  findDetail: findDetailDevice,
  create: createDevice,
  update: updateDevice,
  remove: removeDevice
}
