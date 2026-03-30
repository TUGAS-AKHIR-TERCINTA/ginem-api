import { Router } from 'express'

import { MqttController } from '../controllers/mqtt'
import { MiddleWares } from '../middlewares'
import { mqttPublishStatusSchema, mqttSendCommandSchema } from '../schemas/MqttSchema'

const MqttRoute = Router()

MqttRoute.use(MiddleWares.useAuthorization)

MqttRoute.get('/connection', MqttController.getConnection)

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
