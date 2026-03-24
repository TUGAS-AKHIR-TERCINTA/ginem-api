import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'
import { StatusCodes } from 'http-status-codes'

import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  type WASocket
} from '@whiskeysockets/baileys'

import * as QRCode from 'qrcode'

import logger from '../../logs'
import { AppError } from '../utilities/AppError'

type WhatsAppSessionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface WhatsAppSessionState {
  status: WhatsAppSessionStatus
  qrDataUrl?: string
  qrPng?: Buffer
  lastError?: string
  socket?: WASocket
  authPath: string
  /** Prevents stacking multiple reconnect timers after stream:515 (restartRequired). */
  reconnectScheduled?: boolean
}

interface WhatsAppSendResult {
  toJid: string
  success: boolean
}

/** Shape of `connection.update` payloads from Baileys (subset we use). */
interface BaileysConnectionUpdate {
  connection?: 'connecting' | 'open' | 'close'
  qr?: string
  lastDisconnect?: { error?: { output?: { statusCode?: number } } }
}

// NOTE:
// We intentionally store Baileys auth sessions outside of `src/` so `tsx watch .`
// does not restart the server when Baileys writes session files.
// Default: project root `resources/whatsapp/sessions`. Override with WHATSAPP_SESSION_DIR.
const SESSION_BASE_DIR =
  process.env.WHATSAPP_SESSION_DIR ?? path.join(process.cwd(), '..', 'whatsapp-sessions')

const DEFAULT_QR_WAIT_TIMEOUT_MS = 30_000
const DEFAULT_OPEN_WAIT_TIMEOUT_MS = 20_000
const RECONNECT_AFTER_DISCONNECT_MS = 1500
const WAIT_POLL_INTERVAL_MS = 250

const sessionsByUserId = new Map<number, WhatsAppSessionState>()
const connectInFlightByUserId = new Map<number, Promise<void>>()
const eventEmittersByUserId = new Map<number, EventEmitter>()

function getOrCreateSessionEventEmitter(userId: number): EventEmitter {
  let sessionEventEmitter = eventEmittersByUserId.get(userId)
  if (sessionEventEmitter == null) {
    sessionEventEmitter = new EventEmitter()
    eventEmittersByUserId.set(userId, sessionEventEmitter)
  }
  return sessionEventEmitter
}

function hasActiveSocketForUser(session: WhatsAppSessionState | undefined): boolean {
  if (session == null) return false
  const hasSocket = session.socket != null
  const isConnectedOrConnecting =
    session.status === 'connected' || session.status === 'connecting'
  return hasSocket && isConnectedOrConnecting
}

function normalizePhoneNumberToWhatsAppJid(rawPhoneOrJid: string): string {
  const digitsOnly = rawPhoneOrJid.replace(/[^\d]/g, '')
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    throw AppError.badRequest('Invalid WhatsApp number format')
  }
  return `${digitsOnly}@s.whatsapp.net`
}

async function ensureAuthDirectoryExists(authDirectoryPath: string): Promise<void> {
  await fs.promises.mkdir(authDirectoryPath, { recursive: true })
}

async function waitUntilConditionMet<T>(options: {
  timeoutMs: number
  getValue: () => T | undefined
  onTimeoutMessage: string
}): Promise<T> {
  const deadlineMs = Date.now() + options.timeoutMs
  while (Date.now() < deadlineMs) {
    const currentValue = options.getValue()
    if (currentValue != null) {
      return currentValue
    }
    await new Promise((resolve) => setTimeout(resolve, WAIT_POLL_INTERVAL_MS))
  }
  throw new AppError(options.onTimeoutMessage, StatusCodes.REQUEST_TIMEOUT)
}

async function waitUntilWhatsAppSocketOpen(
  userId: number,
  timeoutMs: number
): Promise<WASocket> {
  return waitUntilConditionMet<WASocket>({
    timeoutMs,
    onTimeoutMessage: 'WhatsApp session is not connected yet',
    getValue: () => {
      const activeSession = sessionsByUserId.get(userId)
      if (activeSession?.status === 'connected' && activeSession.socket != null) {
        return activeSession.socket
      }
      return undefined
    }
  })
}

export class WhatsAppService {
  /**
   * Starts (or resumes) a Baileys socket for this user if none is already active.
   * Idempotent when a connecting/connected socket already exists.
   * Does not throw: also invoked from scheduled reconnect without a caller try/catch.
   */
  private static ensureSessionStarted(userId: number): void {
    try {
      const currentSession = sessionsByUserId.get(userId)
      if (hasActiveSocketForUser(currentSession)) {
        return
      }

      const existingConnectPromise = connectInFlightByUserId.get(userId)
      if (existingConnectPromise != null) {
        return
      }

      const userAuthDirectoryPath = path.join(SESSION_BASE_DIR, String(userId))

      const connectWorkPromise = (async () => {
        const sessionState: WhatsAppSessionState = {
          status: 'connecting',
          authPath: userAuthDirectoryPath
        }
        sessionsByUserId.set(userId, sessionState)

        try {
          await ensureAuthDirectoryExists(userAuthDirectoryPath)

          const { state: authenticationState, saveCreds: persistCredentials } =
            await useMultiFileAuthState(userAuthDirectoryPath)
          const { version: whatsAppWebVersion } = await fetchLatestBaileysVersion()

          const whatsAppSocket = makeWASocket({
            version: whatsAppWebVersion,
            auth: authenticationState,
            printQRInTerminal: false,
            browser: Browsers.macOS('Chrome')
          })

          sessionState.socket = whatsAppSocket

          WhatsAppService.attachBaileysEventHandlers(
            userId,
            sessionState,
            whatsAppSocket,
            persistCredentials
          )
        } catch (startupError) {
          sessionState.status = 'error'
          sessionState.lastError = String(startupError)
          getOrCreateSessionEventEmitter(userId).emit('error', sessionState.lastError)
        }
      })()

      connectInFlightByUserId.set(userId, connectWorkPromise)
      void connectWorkPromise.finally(() => {
        connectInFlightByUserId.delete(userId)
      })
    } catch (error) {
      if (error instanceof AppError) {
        logger.error(`[WhatsAppService] ensureSessionStarted: ${error.message}`)
        return
      }
      logger.error(`[WhatsAppService] ensureSessionStarted failed: ${String(error)}`)
    }
  }

  private static attachBaileysEventHandlers(
    userId: number,
    sessionState: WhatsAppSessionState,
    whatsAppSocket: WASocket,
    persistCredentials: () => Promise<void>
  ): void {
    try {
      whatsAppSocket.ev.on('creds.update', async () => {
        try {
          await persistCredentials()
        } catch (error) {
          if (error instanceof AppError) {
            logger.error(`[WhatsAppService] creds.update: ${error.message}`)
            return
          }
          logger.error(`[WhatsAppService] creds.update failed: ${String(error)}`)
        }
      })

      whatsAppSocket.ev.on('connection.update', async (rawUpdate: unknown) => {
        const connectionUpdate = rawUpdate as BaileysConnectionUpdate
        try {
          await WhatsAppService.handleBaileysConnectionUpdate(
            userId,
            sessionState,
            connectionUpdate
          )
        } catch (error) {
          if (error instanceof AppError) {
            sessionState.lastError = error.message
            logger.error(`[WhatsAppService] connection.update: ${error.message}`)
            return
          }
          logger.error(`[WhatsAppService] connection.update failed: ${String(error)}`)
          sessionState.lastError = 'WhatsApp connection handler error'
        }
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(
        `[WhatsAppService] attachBaileysEventHandlers failed: ${String(error)}`
      )
      throw new AppError(
        'Failed to attach WhatsApp socket handlers',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  private static async handleBaileysConnectionUpdate(
    userId: number,
    sessionState: WhatsAppSessionState,
    connectionUpdate: BaileysConnectionUpdate
  ): Promise<void> {
    try {
      if (connectionUpdate.qr != null && connectionUpdate.qr.length > 0) {
        sessionState.status = 'connecting'

        try {
          const qrCodeDataUrl = await QRCode.toDataURL(connectionUpdate.qr)
          sessionState.qrDataUrl = qrCodeDataUrl
          getOrCreateSessionEventEmitter(userId).emit('qr', qrCodeDataUrl)
        } catch (renderError) {
          sessionState.lastError = `Failed to render QR data URL: ${String(renderError)}`
        }

        try {
          const qrCodePngBuffer = await QRCode.toBuffer(connectionUpdate.qr, {
            type: 'png'
          })
          sessionState.qrPng = qrCodePngBuffer
        } catch (renderError) {
          sessionState.lastError = `Failed to render QR PNG: ${String(renderError)}`
        }
      }

      if (connectionUpdate.connection === 'open') {
        sessionState.status = 'connected'
        sessionState.qrDataUrl = undefined
        sessionState.qrPng = undefined
        getOrCreateSessionEventEmitter(userId).emit('open')
        return
      }

      if (connectionUpdate.connection === 'close') {
        await WhatsAppService.handleBaileysConnectionClosed(
          userId,
          sessionState,
          connectionUpdate
        )
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(
        `[WhatsAppService] handleBaileysConnectionUpdate failed: ${String(error)}`
      )
      throw new AppError(
        'Failed to process WhatsApp connection update',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  private static async handleBaileysConnectionClosed(
    userId: number,
    sessionState: WhatsAppSessionState,
    connectionUpdate: BaileysConnectionUpdate
  ): Promise<void> {
    try {
      const disconnectStatusCode =
        connectionUpdate.lastDisconnect?.error?.output?.statusCode
      const serverRequestedLogout = disconnectStatusCode === DisconnectReason.loggedOut

      sessionState.socket = undefined
      sessionState.qrDataUrl = undefined
      sessionState.qrPng = undefined

      if (serverRequestedLogout) {
        sessionState.status = 'disconnected'
        sessionState.lastError = 'Logged out (new QR required)'
        sessionState.reconnectScheduled = false
        try {
          await fs.promises.rm(sessionState.authPath, { recursive: true, force: true })
        } catch {
          // Best-effort cleanup only
        }
        getOrCreateSessionEventEmitter(userId).emit('close')
        return
      }

      // After QR scan, WhatsApp often closes with 515 (restartRequired). Open a new socket
      // with saved credentials (Baileys recommended pattern).
      sessionState.status = 'connecting'
      sessionState.lastError =
        disconnectStatusCode === DisconnectReason.restartRequired
          ? 'Reconnecting after pairing (restart required)...'
          : undefined

      getOrCreateSessionEventEmitter(userId).emit('close')

      if (sessionState.reconnectScheduled === true) {
        return
      }
      sessionState.reconnectScheduled = true

      setTimeout(() => {
        sessionState.reconnectScheduled = false
        WhatsAppService.ensureSessionStarted(userId)
      }, RECONNECT_AFTER_DISCONNECT_MS)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(
        `[WhatsAppService] handleBaileysConnectionClosed failed: ${String(error)}`
      )
      throw new AppError(
        'Failed to handle WhatsApp disconnect',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async getStatus(
    userId: number
  ): Promise<Pick<WhatsAppSessionState, 'status' | 'qrDataUrl' | 'lastError'>> {
    try {
      const session = sessionsByUserId.get(userId)
      if (session == null) {
        return { status: 'disconnected' }
      }
      return {
        status: session.status,
        qrDataUrl: session.qrDataUrl,
        lastError: session.lastError
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[WhatsAppService] getStatus failed: ${String(error)}`)
      throw new AppError(
        'Failed to get WhatsApp status',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async connectAndWaitForQr(
    userId: number,
    timeoutMs: number = DEFAULT_QR_WAIT_TIMEOUT_MS
  ): Promise<{
    status: WhatsAppSessionStatus
    qrDataUrl?: string
  }> {
    try {
      if (userId <= 0) {
        throw AppError.badRequest('Invalid userId')
      }

      const sessionBeforeStart = sessionsByUserId.get(userId)
      if (
        sessionBeforeStart?.status === 'connected' &&
        sessionBeforeStart.socket != null
      ) {
        return { status: 'connected' }
      }

      WhatsAppService.ensureSessionStarted(userId)

      const sessionAfterStart = sessionsByUserId.get(userId)
      if (sessionAfterStart?.status === 'connected' && sessionAfterStart.socket != null) {
        return { status: 'connected' }
      }

      const qrDataUrl = await waitUntilConditionMet<string>({
        timeoutMs,
        onTimeoutMessage: 'WhatsApp QR code is not ready yet',
        getValue: () => {
          const activeSession = sessionsByUserId.get(userId)
          return activeSession?.qrDataUrl
        }
      })

      return { status: 'connecting', qrDataUrl }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[WhatsAppService] connectAndWaitForQr failed: ${String(error)}`)
      throw new AppError(
        'Failed to connect and retrieve WhatsApp QR',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async sendTextMessage(
    userId: number,
    recipientPhoneNumber: string,
    messageText: string
  ): Promise<WhatsAppSendResult> {
    try {
      if (messageText.trim().length === 0) {
        throw AppError.badRequest('Message must not be empty')
      }
      if (messageText.length > 2000) {
        throw AppError.badRequest('Message too long')
      }

      const recipientJid = normalizePhoneNumberToWhatsAppJid(recipientPhoneNumber)
      const whatsAppSocket = await waitUntilWhatsAppSocketOpen(
        userId,
        DEFAULT_OPEN_WAIT_TIMEOUT_MS
      )

      await whatsAppSocket.sendMessage(recipientJid, { text: messageText })

      return { toJid: recipientJid, success: true }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[WhatsAppService] sendTextMessage failed: ${String(error)}`)
      throw new AppError(
        'Failed to send WhatsApp message',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async disconnect(userId: number): Promise<void> {
    try {
      const session = sessionsByUserId.get(userId)
      if (session?.socket == null) {
        sessionsByUserId.delete(userId)
        return
      }

      try {
        await session.socket.logout()
      } catch {
        // Ignore logout failures (socket may already be closed)
      }

      sessionsByUserId.delete(userId)
      connectInFlightByUserId.delete(userId)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[WhatsAppService] disconnect failed: ${String(error)}`)
      throw new AppError(
        'Failed to disconnect WhatsApp session',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async getQrCodePng(
    userId: number,
    timeoutMs: number = DEFAULT_QR_WAIT_TIMEOUT_MS
  ): Promise<Buffer> {
    try {
      if (userId <= 0) {
        throw AppError.badRequest('Invalid userId')
      }

      const session = sessionsByUserId.get(userId)
      if (session?.status === 'connected' && session.socket != null) {
        throw AppError.conflict(
          'WhatsApp session is already connected. QR is not required.'
        )
      }

      WhatsAppService.ensureSessionStarted(userId)

      return waitUntilConditionMet<Buffer>({
        timeoutMs,
        onTimeoutMessage: 'WhatsApp QR code is not ready yet',
        getValue: () => sessionsByUserId.get(userId)?.qrPng
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[WhatsAppService] getQrCodePng failed: ${String(error)}`)
      throw new AppError(
        'Failed to generate WhatsApp QR code',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
