import { Router } from 'express'

import { WhatsappController } from '../controllers/whatsapp/index'
import { MiddleWares } from '../middlewares/index'
import {
  whatsappConnectBodySchema,
  whatsappConnectQuerySchema,
  whatsappDisconnectBodySchema
} from '../schemas/WhatsAppSchema'

const WhatsAppRoute = Router()

WhatsAppRoute.use(MiddleWares.useAuthorization)

WhatsAppRoute.get(
  '/connect',
  MiddleWares.validate({
    body: whatsappConnectBodySchema,
    query: whatsappConnectQuerySchema
  }),
  WhatsappController.connect
)

WhatsAppRoute.get('/connection-status', WhatsappController.connectionStatus)

WhatsAppRoute.post(
  '/disconnect',
  MiddleWares.validate({ body: whatsappDisconnectBodySchema }),
  WhatsappController.disconnect
)

export default WhatsAppRoute
