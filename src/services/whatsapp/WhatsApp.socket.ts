import { StatusCodes } from 'http-status-codes'
import {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeWASocket,
  type BaileysEventMap,
  type WAMessage,
  type WASocket,
  useMultiFileAuthState
} from '@whiskeysockets/baileys'

import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'
import { WHATSAPP_RECONNECT_DELAY_MS } from './constants'
import {
  disconnectErrorMessage,
  disconnectStatusCode,
  isTransientDisconnect,
  logQrForSession,
  plainTextFromMessage
} from './helpers'
import type { WhatsappConnectionStatus } from './types'
import { ChatService } from '../Chat.service'
import pino from 'pino'

type AuthBundle = Awaited<ReturnType<typeof useMultiFileAuthState>>
type WaVersion = Awaited<ReturnType<typeof fetchLatestBaileysVersion>>['version']

const LOG_PREFIX = '[WhatsappService]'

export type WhatsappSocketBindings = {
  userLabel: () => string
  getAuth: () => AuthBundle['state']
  getWaVersion: () => WaVersion
  getSaveCreds: () => AuthBundle['saveCreds']
  getSocket: () => WASocket | undefined
  setSocket: (s: WASocket | undefined) => void
  setConnectionState: (s: WhatsappConnectionStatus) => void
  getLastPairingQr: () => string | undefined
  setLastPairingQr: (v: string | undefined) => void
  getLastDisconnectReason: () => string | undefined
  setLastDisconnectReason: (v: string | undefined) => void
  getIntentionalDisconnect: () => boolean
  getReconnectScheduled: () => boolean
  setReconnectScheduled: (v: boolean) => void
  requestAttachSocket: () => void
}

/** Socket Baileys + event `connection.update` / `messages.upsert` (dipakai oleh `WhatsappService`). */
export class WhatsappBaileysSocket {
  constructor(private readonly bind: WhatsappSocketBindings) {}

  /**
   * Tutup socket WA, hentikan reconnect, dan bersihkan listener event.
   * Kredensial di disk tidak dihapus — panggil `attach()` / `connect()` untuk menyambung lagi.
   */
  detach(): void {
    this.bind.setReconnectScheduled(false)
    this.bind.setLastPairingQr(undefined)
    const sock = this.bind.getSocket()
    if (sock == null) return
    try {
      sock.ev.removeAllListeners('creds.update')
      sock.ev.removeAllListeners('connection.update')
      sock.ev.removeAllListeners('messages.upsert')
    } catch (error) {
      logger.warn(`${LOG_PREFIX} detach removeListeners: ${String(error)}`)
    }
    this.bind.setSocket(undefined)
    try {
      sock.end(undefined)
    } catch (error) {
      logger.warn(`${LOG_PREFIX} detach end failed: ${String(error)}`)
    }
  }

  attach(): void {
    try {
      this.bind.getSocket()?.end(undefined)
      this.bind.setReconnectScheduled(false)
      this.bind.setLastPairingQr(undefined)

      const sock = makeWASocket({
        version: this.bind.getWaVersion(),
        auth: this.bind.getAuth(),
        browser: Browsers.macOS('Chrome'),
        syncFullHistory: false,
        logger: pino({ level: 'silent' })
      })
      this.bind.setSocket(sock)

      sock.ev.on('creds.update', this.bind.getSaveCreds())
      sock.ev.on('connection.update', (u) => void this.onConnectionChange(u))
      sock.ev.on('messages.upsert', (p) => this.onInboundMessages(p))
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`${LOG_PREFIX} attachSocket failed: ${String(error)}`)
      this.bind.setConnectionState('error')
      throw new AppError(
        'Failed to open WhatsApp socket',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  private async onConnectionChange(
    update: Partial<BaileysEventMap['connection.update']>
  ): Promise<void> {
    try {
      const { connection, lastDisconnect, qr } = update

      if (qr != null && qr.length > 0) {
        this.bind.setLastPairingQr(qr)
        await logQrForSession(this.bind.userLabel(), qr)
      }

      if (connection === 'open') {
        this.bind.setConnectionState('connected')
        this.bind.setLastDisconnectReason(undefined)
        this.bind.setLastPairingQr(undefined)
        logger.info(`${LOG_PREFIX} connected (${this.bind.userLabel()})`)
        return
      }

      if (connection !== 'close') return

      await this.onSocketClosed(lastDisconnect)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`${LOG_PREFIX} connection.update handler failed: ${String(error)}`)
    }
  }

  private async onSocketClosed(
    lastDisconnect: BaileysEventMap['connection.update']['lastDisconnect']
  ): Promise<void> {
    const code = disconnectStatusCode(lastDisconnect)
    const message = disconnectErrorMessage(lastDisconnect)
    this.bind.setLastDisconnectReason(message)
    logger.warn(`${LOG_PREFIX} socket closed (${this.bind.userLabel()}): ${message}`)

    this.bind.setSocket(undefined)

    if (this.bind.getIntentionalDisconnect()) {
      this.bind.setConnectionState('disconnected')
      return
    }

    if (code === DisconnectReason.loggedOut) {
      this.bind.setConnectionState('disconnected')
      this.bind.setLastDisconnectReason('Logged out — scan QR again')
      return
    }

    if (!isTransientDisconnect(code) || this.bind.getReconnectScheduled()) {
      this.bind.setConnectionState('error')
      return
    }

    this.bind.setConnectionState('connecting')
    this.bind.setReconnectScheduled(true)
    setTimeout(() => this.retryOpen(), WHATSAPP_RECONNECT_DELAY_MS)
  }

  private retryOpen(): void {
    try {
      this.bind.setReconnectScheduled(false)
      if (this.bind.getIntentionalDisconnect()) {
        this.bind.setConnectionState('disconnected')
        return
      }
      this.bind.requestAttachSocket()
    } catch (error) {
      if (error instanceof AppError) {
        logger.error(`${LOG_PREFIX} retryOpen: ${error.message}`)
      } else {
        logger.error(`${LOG_PREFIX} retryOpen failed: ${String(error)}`)
      }
      this.bind.setConnectionState('error')
    }
  }

  private onInboundMessages(payload: BaileysEventMap['messages.upsert']): void {
    for (const msg of payload.messages) {
      void this.maybePingPong(msg)
    }
  }

  private async maybePingPong(msg: WAMessage): Promise<void> {
    try {
      const sock = this.bind.getSocket()
      if (sock == null || msg.message == null || msg.key.fromMe) return

      const chat = msg.key.remoteJid
      if (chat == null || chat === 'status@broadcast') return

      console.log('chat: ', chat)
      console.log('userLabel: ', this.bind.userLabel())

      const incoming = plainTextFromMessage(msg.message)
      // if (incoming?.trim().toLowerCase() !== 'ping') return

      if (chat !== '6281379574223@s.whatsapp.net') return

      console.log('incoming: ', incoming)

      const answer = await ChatService.query(incoming ?? '')

      await sock.sendMessage(chat, { text: answer }, { quoted: msg })
      logger.info(`${LOG_PREFIX} auto-reply pong → ${chat} (${this.bind.userLabel()})`)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`${LOG_PREFIX} maybePingPong failed: ${String(error)}`)
    }
  }
}
