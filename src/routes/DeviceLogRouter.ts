import { Router } from 'express'
import { DeviceLogController } from '../controllers/deviceLog'
import { MiddleWares } from '../middlewares'
import { findAllDeviceLogSchema } from '../schemas/DeviceLogSchema'
import { findDetailDeviceLogSchema } from '../schemas/DeviceLogSchema'
import { createDeviceLogSchema } from '../schemas/DeviceLogSchema'
import { updateDeviceLogSchema } from '../schemas/DeviceLogSchema'
import { removeDeviceLogSchema } from '../schemas/DeviceLogSchema'

const DeviceLogRoute = Router()

DeviceLogRoute.use(MiddleWares.useAuthorization)

DeviceLogRoute.get(
  '/',
  MiddleWares.validate({ query: findAllDeviceLogSchema }),
  DeviceLogController.findAll
)
DeviceLogRoute.get(
  '/detail/:deviceLogId',
  MiddleWares.validate({ params: findDetailDeviceLogSchema }),
  DeviceLogController.findDetail
)
DeviceLogRoute.post(
  '/',
  MiddleWares.validate({ body: createDeviceLogSchema }),
  DeviceLogController.create
)
DeviceLogRoute.patch(
  '/:deviceLogId',
  MiddleWares.validate({ body: updateDeviceLogSchema }),
  DeviceLogController.update
)
DeviceLogRoute.delete(
  '/:deviceLogId',
  MiddleWares.validate({ params: removeDeviceLogSchema }),
  DeviceLogController.remove
)

export default DeviceLogRoute
