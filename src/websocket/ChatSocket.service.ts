import type { Server as HttpServer } from 'http'
import { WebSocketServer, WebSocket, type RawData } from 'ws'
import { z } from 'zod'
import { AppError } from '../utilities/AppError'
import { verifyAccessToken } from '../utilities/jwt'
import { ChatMessageBroker } from '../services/rabbitmq/ChatMessageBroker.service'
import logger from '../utilities/logger'

const LOG_PREFIX = '[ChatSocket]'
const WS_PATH = '/api/v1/chat/ws'
const HEARTBEAT_INTERVAL_MS = 30_000

/**
 * WebSocket message contract (JSON text frames both ways).
 *
 * Client -> Server:
 *   { "requestId"?: string, "message": string, "sessionId"?: string, "withAudio"?: boolean }
 *
 * Server -> Client:
 *   Connection ack   { "type": "connected", "userId": number }
 *   Success reply    { "type": "chat.reply", "requestId"?: string, "data": { reply, audio? } }
 *   Error            { "type": "chat.error", "requestId"?: string, "message": string, "statusCode"?: number }
 *
 * There is no `audioFormat` field like the REST endpoint — audio (when `withAudio: true`)
 * always comes back as base64 JSON (equivalent to the REST endpoint's `audioFormat: "json"`).
 * The REST-only `audioFormat: "binary"` download path has no WebSocket equivalent.
 */
const chatWsMessageSchema = z.object({
  requestId: z.string().min(1).max(191).optional(),
  message: z.string().min(1).max(2000),
  sessionId: z.string().min(1).max(191).optional(),
  withAudio: z.boolean().optional().default(false)
})

interface HeartbeatSocket extends WebSocket {
  isAlive?: boolean
}

function rawDataToString(data: RawData): string {
  if (Buffer.isBuffer(data)) return data.toString('utf8')
  if (Array.isArray(data)) return Buffer.concat(data as Uint8Array[]).toString('utf8')
  return Buffer.from(data).toString('utf8')
}

function send(ws: WebSocket, payload: Record<string, unknown>): void {
  if (ws.readyState !== WebSocket.OPEN) return
  ws.send(JSON.stringify(payload))
}

function sendError(
  ws: WebSocket,
  message: string,
  options?: { requestId?: string; statusCode?: number }
): void {
  send(ws, {
    type: 'chat.error',
    ...(options?.requestId != null ? { requestId: options.requestId } : {}),
    message,
    ...(options?.statusCode != null ? { statusCode: options.statusCode } : {})
  })
}

async function handleMessage(ws: WebSocket, userId: number, raw: string): Promise<void> {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    sendError(ws, 'Invalid JSON payload')
    return
  }

  const result = chatWsMessageSchema.safeParse(parsed)
  if (!result.success) {
    const requestId =
      typeof (parsed as { requestId?: unknown })?.requestId === 'string'
        ? (parsed as { requestId: string }).requestId
        : undefined
    sendError(ws, result.error.issues.map((i) => i.message).join('; '), { requestId })
    return
  }

  const { requestId, message, sessionId, withAudio } = result.data

  try {
    const reply = await ChatMessageBroker.requestChat(message, {
      source: 'web',
      withAudio,
      userId,
      sessionId: sessionId ?? `web:${userId}`
    })

    send(ws, {
      type: 'chat.reply',
      ...(requestId != null ? { requestId } : {}),
      data: reply
    })
  } catch (error) {
    const errMessage =
      error instanceof AppError ? error.message : 'Failed to process chat message'
    const statusCode = error instanceof AppError ? error.statusCode : undefined
    logger.error(`${LOG_PREFIX} handleMessage failed userId=${userId}: ${errMessage}`)
    sendError(ws, errMessage, { requestId, statusCode })
  }
}

let wss: WebSocketServer | undefined
let heartbeatTimer: ReturnType<typeof setInterval> | undefined

export class ChatSocketService {
  /**
   * Attach the chat WebSocket server to the app's HTTP server at `/api/v1/chat/ws`.
   * Authenticate via `?token=<accessToken>` query param (same JWT used for
   * `Authorization: Bearer` on the REST endpoint) since a browser WebSocket
   * handshake cannot set custom headers.
   */
  static initialize(server: HttpServer): void {
    if (wss != null) return

    wss = new WebSocketServer({ server, path: WS_PATH })

    wss.on('connection', (ws: HeartbeatSocket, request) => {
      const url = new URL(request.url ?? '', 'http://localhost')
      const token = url.searchParams.get('token') ?? ''
      const jwtPayload = token !== '' ? verifyAccessToken(token) : false

      if (jwtPayload === false) {
        ws.close(4401, 'Invalid or missing token')
        return
      }

      const { userId } = jwtPayload
      ws.isAlive = true
      ws.on('pong', () => {
        ws.isAlive = true
      })

      send(ws, { type: 'connected', userId })

      ws.on('message', (data) => {
        void handleMessage(ws, userId, rawDataToString(data))
      })

      ws.on('error', (error) => {
        logger.error(`${LOG_PREFIX} socket error userId=${userId}: ${String(error)}`)
      })
    })

    heartbeatTimer = setInterval(() => {
      wss?.clients.forEach((client) => {
        const ws = client as HeartbeatSocket
        if (ws.isAlive === false) {
          ws.terminate()
          return
        }
        ws.isAlive = false
        ws.ping()
      })
    }, HEARTBEAT_INTERVAL_MS)

    logger.info(`${LOG_PREFIX} listening at ${WS_PATH}`)
  }

  static async shutdown(): Promise<void> {
    if (heartbeatTimer != null) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = undefined
    }

    if (wss == null) return

    await new Promise<void>((resolve) => {
      wss?.clients.forEach((client) => {
        client.close(1001, 'Server shutting down')
      })
      wss?.close(() => {
        resolve()
      })
    })
    wss = undefined
  }
}
