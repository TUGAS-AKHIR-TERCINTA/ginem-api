import { connectWhatsApp } from './connect'
import { disconnectWhatsApp } from './disconnect'
import { getWhatsAppStatus } from './status'
import { getWhatsAppQrPng } from './qr'
import { getWhatsAppQrBase64 } from './qrBase64'
import { sendWhatsAppTextMessage } from './send'

export const WhatsAppController = {
  connect: connectWhatsApp,
  sendText: sendWhatsAppTextMessage,
  status: getWhatsAppStatus,
  disconnect: disconnectWhatsApp,
  qrPng: getWhatsAppQrPng,
  qrBase64: getWhatsAppQrBase64
}
