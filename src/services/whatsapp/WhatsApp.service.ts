import path from 'path'
import { rm } from 'fs/promises'

import { StatusCodes } from 'http-status-codes'
import {
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  type WASocket
} from '@whiskeysockets/baileys'

import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'
import {
  WHATSAPP_PAIRING_QR_POLL_MS,
  WHATSAPP_PAIRING_QR_WAIT_DEFAULT_MS,
  WHATSAPP_SESSIONS_ROOT
} from './constants'
import { pairingQrToPngBuffer, sleep } from './helpers'
import type { WhatsappConnectionStatus, WhatsappPairingConnectResult } from './types'
import { WhatsappBaileysSocket, type WhatsappSocketBindings } from './WhatsApp.socket'

type AuthBundle = Awaited<ReturnType<typeof useMultiFileAuthState>>
type WaVersion = Awaited<ReturnType<typeof fetchLatestBaileysVersion>>['version']

const LOG_PREFIX = '[WhatsappService]'

const DISCONNECT_CLEARED_MESSAGE =
  'Session removed. Connect again and scan the QR code on your phone.'

/**
 * WhatsApp (Baileys) per user aplikasi. Socket & event di `WhatsApp.socket.ts`.
 */
export class WhatsappService {
  private static readonly instancesByUserId = new Map<number, WhatsappService>()

  static forUser(userId: number): WhatsappService {
    const hit = WhatsappService.instancesByUserId.get(userId)
    if (hit != null) return hit
    const created = new WhatsappService(userId)
    WhatsappService.instancesByUserId.set(userId, created)
    return created
  }

  readonly userId: number | string
  private readonly authDir: string

  private socket: WASocket | undefined
  private reconnectScheduled = false
  private intentionalDisconnect = false
  private credentialsReady = false

  private auth!: AuthBundle['state']
  private saveCreds!: AuthBundle['saveCreds']
  private waVersion!: WaVersion

  private state: WhatsappConnectionStatus = 'disconnected'
  private connectPromise: Promise<void> | undefined

  public lastDisconnectReason: string | undefined
  private lastPairingQr: string | undefined

  private readonly baileysSocket: WhatsappBaileysSocket

  get connectionStatus(): WhatsappConnectionStatus {
    return this.state
  }

  constructor(userId: number | string, sessionsRoot: string = WHATSAPP_SESSIONS_ROOT) {
    this.userId = userId
    this.authDir = path.join(sessionsRoot, String(userId))
    this.baileysSocket = new WhatsappBaileysSocket(this.socketBindings())
  }

  private socketBindings(): WhatsappSocketBindings {
    return {
      userLabel: () => this.userLabel(),
      getAuth: () => this.auth,
      getWaVersion: () => this.waVersion,
      getSaveCreds: () => this.saveCreds,
      getSocket: () => this.socket,
      setSocket: (s) => {
        this.socket = s
      },
      setConnectionState: (s) => {
        this.state = s
      },
      getLastPairingQr: () => this.lastPairingQr,
      setLastPairingQr: (v) => {
        this.lastPairingQr = v
      },
      getLastDisconnectReason: () => this.lastDisconnectReason,
      setLastDisconnectReason: (v) => {
        this.lastDisconnectReason = v
      },
      getIntentionalDisconnect: () => this.intentionalDisconnect,
      getReconnectScheduled: () => this.reconnectScheduled,
      setReconnectScheduled: (v) => {
        this.reconnectScheduled = v
      },
      requestAttachSocket: () => this.baileysSocket.attach()
    }
  }

  private userLabel(): string {
    return `user=${this.userId}`
  }

  async connect(): Promise<void> {
    if (this.connectPromise != null) return this.connectPromise

    this.connectPromise = (async () => {
      try {
        await this.openSession()
      } catch (error) {
        if (error instanceof AppError) throw error
        logger.error(`${LOG_PREFIX} connect failed: ${String(error)}`)
        throw new AppError(
          'Failed to connect WhatsApp',
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      }
    })().finally(() => {
      this.connectPromise = undefined
    })

    return this.connectPromise
  }

  async connectAwaitingPairingQr(timeoutMs?: number): Promise<WhatsappPairingConnectResult> {
    const waitMs = timeoutMs ?? WHATSAPP_PAIRING_QR_WAIT_DEFAULT_MS
    try {
      await this.connect()
      const deadline = Date.now() + waitMs
      while (Date.now() < deadline) {
        const qr = this.lastPairingQr
        if (qr != null && qr.length > 0) {
          return {
            connectionStatus: this.state,
            timedOut: false,
            pairingQrRaw: qr
          }
        }
        if (this.state === 'connected') {
          return { connectionStatus: 'connected', timedOut: false }
        }
        if (this.state === 'error') {
          return { connectionStatus: 'error', timedOut: false }
        }
        await sleep(WHATSAPP_PAIRING_QR_POLL_MS)
      }
      return {
        connectionStatus: this.state,
        timedOut: true,
        ...(this.lastPairingQr != null && this.lastPairingQr.length > 0
          ? { pairingQrRaw: this.lastPairingQr }
          : {})
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`${LOG_PREFIX} connectAwaitingPairingQr failed: ${String(error)}`)
      throw new AppError(
        'Failed to connect WhatsApp',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async renderPairingQrPng(qrPayload: string): Promise<Buffer> {
    try {
      return await pairingQrToPngBuffer(qrPayload)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`${LOG_PREFIX} renderPairingQrPng failed: ${String(error)}`)
      throw new AppError(
        'Failed to render WhatsApp QR image',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  /**
   * Logout dari WhatsApp (jika sedang connected), hapus folder sesi di disk, dan reset auth di memori.
   * Setelah ini, `connect` memerlukan pairing QR lagi; bootstrap server juga tidak akan auto-connect user ini.
   */
  async disconnect(): Promise<void> {
    try {
      this.reconnectScheduled = false
      this.lastPairingQr = undefined

      const sock = this.socket
      const wasConnected = this.state === 'connected'

      if (sock != null && wasConnected) {
        this.intentionalDisconnect = false
        try {
          await sock.logout()
        } catch (error) {
          logger.warn(
            `${LOG_PREFIX} logout() failed (${this.userLabel()}), closing socket: ${String(error)}`
          )
          this.intentionalDisconnect = true
          this.baileysSocket.detach()
        }
      } else if (sock != null) {
        this.intentionalDisconnect = true
        this.baileysSocket.detach()
      }

      this.baileysSocket.detach()

      try {
        await rm(this.authDir, { recursive: true, force: true })
        logger.info(`${LOG_PREFIX} session dir removed (${this.userLabel()}): ${this.authDir}`)
      } catch (error) {
        if (error instanceof AppError) throw error
        logger.error(`${LOG_PREFIX} remove session dir failed: ${String(error)}`)
        throw new AppError(
          'Failed to remove WhatsApp session from disk',
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      }

      this.credentialsReady = false
      this.intentionalDisconnect = false
      this.state = 'disconnected'
      this.lastDisconnectReason = DISCONNECT_CLEARED_MESSAGE
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`${LOG_PREFIX} disconnect failed: ${String(error)}`)
      throw new AppError(
        'Failed to disconnect WhatsApp',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async sendMessage(jid: string, text: string): Promise<void> {
    try {
      const to = jid.trim()
      const body = text.trim()
      if (!to) {
        throw AppError.badRequest('WhatsApp recipient (jid) is required')
      }
      if (!body) {
        throw AppError.badRequest('Message text is required')
      }

      if (this.socket == null || this.state !== 'connected') {
        throw AppError.conflict(
          `WhatsApp is not connected (status: ${this.state})`
        )
      }

      await this.socket.sendMessage(to, { text: body })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`${LOG_PREFIX} sendMessage failed: ${String(error)}`)
      throw new AppError(
        'Failed to send WhatsApp message',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  private async openSession(): Promise<void> {
    this.intentionalDisconnect = false
    await this.loadCredentialsOnce()

    if (this.state === 'connected' && this.socket != null) return
    if (this.socket != null && this.state === 'connecting') return

    this.state = 'connecting'
    this.lastDisconnectReason = undefined
    this.baileysSocket.attach()
  }

  private async loadCredentialsOnce(): Promise<void> {
    if (this.credentialsReady) return
    try {
      const bundle = await useMultiFileAuthState(this.authDir)
      this.auth = bundle.state
      this.saveCreds = bundle.saveCreds
      this.waVersion = (await fetchLatestBaileysVersion()).version
      this.credentialsReady = true
      logger.info(`${LOG_PREFIX} session dir ready (${this.userLabel()}): ${this.authDir}`)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`${LOG_PREFIX} loadCredentials failed: ${String(error)}`)
      throw new AppError(
        'Failed to load WhatsApp session',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
