import { connectWhatsapp } from './connect'
import { disconnectWhatsapp } from './disconnect'
import { getWhatsappConnectionStatus } from './status'

export const WhatsappController = {
  connect: connectWhatsapp,
  connectionStatus: getWhatsappConnectionStatus,
  disconnect: disconnectWhatsapp
}
