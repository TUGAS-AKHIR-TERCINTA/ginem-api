import { Router } from 'express'
import { DeviceController } from '../controllers/device'
import { MiddleWares } from '../middlewares'
import {
  createDeviceSchema,
  findAllDeviceSchema,
  findDetailDeviceSchema,
  removeDeviceSchema,
  updateDeviceSchema
} from '../schemas/DeviceSchema'

const DeviceRoute = Router()

DeviceRoute.get(
  '/',
  MiddleWares.validate({ query: findAllDeviceSchema }),
  DeviceController.findAll
)

DeviceRoute.get(
  '/detail/:deviceId',
  MiddleWares.validate({ params: findDetailDeviceSchema }),
  DeviceController.findDetail
)

DeviceRoute.post(
  '/',
  MiddleWares.validate({ body: createDeviceSchema }),
  DeviceController.create
)

DeviceRoute.patch(
  '/',
  MiddleWares.validate({ body: updateDeviceSchema }),
  DeviceController.update
)

DeviceRoute.delete(
  '/:deviceId',
  MiddleWares.validate({ params: removeDeviceSchema }),
  DeviceController.remove
)

export default DeviceRoute
