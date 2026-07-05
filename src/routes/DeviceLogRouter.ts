import { Router } from 'express'
import { DeviceLogController } from '../controllers/deviceLog/index'
import { MiddleWares } from '../middlewares/index'
import { findAllDeviceLogSchema, findDetailDeviceLogSchema, findLastLatestDeviceLogByDeviceIdSchema, createDeviceLogSchema, updateDeviceLogSchema, removeDeviceLogSchema } from '../schemas/DeviceLogSchema'

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
DeviceLogRoute.get(
  '/last/:deviceId',
  MiddleWares.validate({ params: findLastLatestDeviceLogByDeviceIdSchema }),
  DeviceLogController.findLast
)
DeviceLogRoute.get(
  '/latest/:deviceId',
  MiddleWares.validate({ params: findLastLatestDeviceLogByDeviceIdSchema }),
  DeviceLogController.findLatest
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
