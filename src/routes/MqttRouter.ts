import { Router } from 'express'

import { MqttController } from '../controllers/mqtt/index'
import { MiddleWares } from '../middlewares/index'
import {
  mqttDeviceIdParamSchema,
  mqttPublishStatusSchema,
  mqttSendCommandSchema
} from '../schemas/MqttSchema'

const MqttRoute = Router()

MqttRoute.use(MiddleWares.useAuthorization)

MqttRoute.get('/connection', MqttController.getConnection)

MqttRoute.get(
  '/devices/:deviceId/status',
  MiddleWares.validate({ params: mqttDeviceIdParamSchema }),
  MqttController.getLastStatus
)

MqttRoute.post(
  '/commands',
  MiddleWares.validate({ body: mqttSendCommandSchema }),
  MqttController.sendCommand
)

MqttRoute.post(
  '/status',
  MiddleWares.validate({ body: mqttPublishStatusSchema }),
  MqttController.publishStatus
)

export default MqttRoute
