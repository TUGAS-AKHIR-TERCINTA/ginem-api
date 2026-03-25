import { Router } from 'express'

import { WhatsappController } from '../controllers/whatsapp'
import { MiddleWares } from '../middlewares'
import {
  whatsappConnectBodySchema,
  whatsappConnectQuerySchema,
  whatsappDisconnectBodySchema
} from '../schemas/WhatsAppSchema'

const WhatsAppRoute = Router()

WhatsAppRoute.use(MiddleWares.useAuthorization)

WhatsAppRoute.post(
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
