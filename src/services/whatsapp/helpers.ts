import { DisconnectReason } from '@whiskeysockets/baileys'
import type { BaileysEventMap, WAMessage } from '@whiskeysockets/baileys'
import * as QRCode from 'qrcode'

import logger from '../../utilities/logger'

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function pairingQrToPngBuffer(qrPayload: string): Promise<Buffer> {
  return QRCode.toBuffer(qrPayload, { type: 'png' })
}

const LOG_PREFIX = '[WhatsappService]'

type LastDisconnect = BaileysEventMap['connection.update']['lastDisconnect']

type BoomLike = Error & { output?: { statusCode?: number } }

export function disconnectStatusCode(last: LastDisconnect | undefined): number | undefined {
  const err = last?.error as BoomLike | undefined
  return err?.output?.statusCode
}

export function disconnectErrorMessage(last: LastDisconnect | undefined): string {
  const err = last?.error as Error | undefined
  const code = disconnectStatusCode(last)
  return err?.message ?? String(code ?? 'unknown')
}

export function isTransientDisconnect(code: number | undefined): boolean {
  if (code == null) return false
  return (
    code === DisconnectReason.restartRequired ||
    code === DisconnectReason.connectionClosed ||
    code === DisconnectReason.connectionLost ||
    code === DisconnectReason.timedOut
  )
}

export function plainTextFromMessage(
  body: NonNullable<WAMessage['message']>
): string | undefined {
  if (typeof body.conversation === 'string' && body.conversation.length > 0) {
    return body.conversation
  }
  const extended = body.extendedTextMessage?.text
  if (typeof extended === 'string' && extended.length > 0) return extended
  return undefined
}

export async function logQrForSession(userLabel: string, qr: string): Promise<void> {
  const ascii = await QRCode.toString(qr, { type: 'terminal', small: true })
  logger.info(`${LOG_PREFIX} ${userLabel} — scan QR:\n${ascii}`)
}
