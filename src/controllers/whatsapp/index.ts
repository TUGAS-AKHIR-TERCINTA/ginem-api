import { connectWhatsapp } from './connect'
import { getWhatsappConnectionStatus } from './status'

export const WhatsappController = {
  connect: connectWhatsapp,
  connectionStatus: getWhatsappConnectionStatus
}
