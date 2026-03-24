import { Router } from 'express'

import { MiddleWares } from '../middlewares'
import { WhatsAppController } from '../controllers/whatsapp'
import {
  whatsappConnectSchema,
  whatsappSendMessageSchema,
  whatsappQrQuerySchema
} from '../schemas/WhatsAppSchema'

const WhatsAppRoute = Router()

WhatsAppRoute.use(MiddleWares.useAuthorization)

WhatsAppRoute.post(
  '/connect',
  MiddleWares.validate({ body: whatsappConnectSchema }),
  WhatsAppController.connect
)

WhatsAppRoute.get('/status', WhatsAppController.status)

WhatsAppRoute.get(
  '/qr',
  MiddleWares.validate({ query: whatsappQrQuerySchema }),
  WhatsAppController.qrPng
)

WhatsAppRoute.get(
  '/qr-base64',
  MiddleWares.validate({ query: whatsappQrQuerySchema }),
  WhatsAppController.qrBase64
)

WhatsAppRoute.post(
  '/send',
  MiddleWares.validate({ body: whatsappSendMessageSchema }),
  WhatsAppController.sendText
)

WhatsAppRoute.post('/disconnect', WhatsAppController.disconnect)

export default WhatsAppRoute
