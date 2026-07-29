import type { Channel, ConsumeMessage } from 'amqplib'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'

import { appConfigs } from '../../configs/appConfig'
import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'
import { ChatService, type ChatQueryOptions, type ChatQueryResponse } from '../chat'
import { closeRabbitConnection, getChatQueueName, getRabbitChannel } from './connection'
import { LOG_PREFIX } from './constants'
import type { ChatMessageSource, ChatQueueReply, ChatQueueRequest } from './types'

let consumerTag: string | undefined
let started = false

function parseRequest(raw: Buffer): ChatQueueRequest {
  return JSON.parse(raw.toString('utf8')) as ChatQueueRequest
}

function parseReply(raw: Buffer): ChatQueueReply {
  return JSON.parse(raw.toString('utf8')) as ChatQueueReply
}

async function processChatRequest(request: ChatQueueRequest): Promise<ChatQueueReply> {
  try {
    const result = await ChatService.query(request.message, {
      withAudio: request.withAudio === true,
      source: request.source,
      ...(request.userId != null ? { userId: request.userId } : {}),
      ...(request.sessionId != null && request.sessionId !== ''
        ? { sessionId: request.sessionId }
        : {})
    })

    return {
      messageId: request.messageId,
      ok: true,
      reply: result.reply,
      ...(result.audio != null ? { audio: result.audio } : {})
    }
  } catch (error) {
    const message =
      error instanceof AppError ? error.message : 'Failed to process chat message'
    const statusCode =
      error instanceof AppError ? error.statusCode : StatusCodes.INTERNAL_SERVER_ERROR
    logger.error(
      `${LOG_PREFIX} process failed messageId=${request.messageId}: ${message}`
    )
    return {
      messageId: request.messageId,
      ok: false,
      error: message,
      statusCode
    }
  }
}

async function onQueuedMessage(
  channel: Channel,
  msg: ConsumeMessage | null
): Promise<void> {
  if (msg == null) return

  let request: ChatQueueRequest
  try {
    request = parseRequest(msg.content)
  } catch (error) {
    logger.error(`${LOG_PREFIX} invalid queue payload: ${String(error)}`)
    channel.nack(msg, false, false)
    return
  }

  logger.info(
    `${LOG_PREFIX} consume source=${request.source} messageId=${request.messageId}`
  )

  const reply = await processChatRequest(request)

  if (msg.properties.replyTo != null && msg.properties.replyTo !== '') {
    channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(reply)), {
      correlationId: msg.properties.correlationId,
      contentType: 'application/json'
    })
  }

  channel.ack(msg)
}

export interface ChatBrokerRequestOptions extends ChatQueryOptions {
  source?: ChatMessageSource
}

/**
 * RabbitMQ bridge for chat → LLM.
 * Web and WhatsApp both enqueue here; callers wait for the LLM reply (RPC).
 */
export class ChatMessageBroker {
  static async initialize(): Promise<void> {
    if (started) return

    try {
      const channel = await getRabbitChannel()
      const queue = getChatQueueName()

      const consume = await channel.consume(
        queue,
        (msg) => {
          void onQueuedMessage(channel, msg)
        },
        { noAck: false }
      )
      consumerTag = consume.consumerTag
      started = true
      logger.info(`${LOG_PREFIX} consumer started tag=${consumerTag}`)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`${LOG_PREFIX} initialize failed: ${String(error)}`)
      throw new AppError(
        'Failed to start chat message broker',
        StatusCodes.SERVICE_UNAVAILABLE
      )
    }
  }

  static async shutdown(): Promise<void> {
    try {
      if (consumerTag != null) {
        const channel = await getRabbitChannel().catch(() => undefined)
        if (channel != null) {
          await channel.cancel(consumerTag)
        }
        consumerTag = undefined
      }
      started = false
      await closeRabbitConnection()
    } catch (error) {
      logger.warn(`${LOG_PREFIX} shutdown failed: ${String(error)}`)
      started = false
      consumerTag = undefined
    }
  }

  /**
   * Enqueue a chat turn and wait for the LLM reply (RPC over RabbitMQ).
   */
  static async requestChat(
    message: string,
    options?: ChatBrokerRequestOptions
  ): Promise<ChatQueryResponse> {
    const channel = await getRabbitChannel()
    const messageId = uuidv4()
    const correlationId = uuidv4()
    const timeoutMs = appConfigs.rabbitmq.chatReplyTimeoutMs
    const source: ChatMessageSource = options?.source ?? 'web'

    const replyQueue = await channel.assertQueue('', {
      exclusive: true,
      autoDelete: true
    })

    const request: ChatQueueRequest = {
      messageId,
      source,
      message,
      withAudio: options?.withAudio === true,
      ...(options?.userId != null ? { userId: options.userId } : {}),
      ...(options?.sessionId != null && options.sessionId !== ''
        ? { sessionId: options.sessionId }
        : {})
    }

    return await new Promise<ChatQueryResponse>((resolve, reject) => {
      let consumerCancel: string | undefined
      const timer = setTimeout(() => {
        if (consumerCancel != null) {
          void channel.cancel(consumerCancel)
        }
        reject(
          new AppError(
            'Timed out waiting for chat reply from message broker',
            StatusCodes.GATEWAY_TIMEOUT
          )
        )
      }, timeoutMs)

      void channel
        .consume(
          replyQueue.queue,
          (msg) => {
            if (msg == null) return
            if (msg.properties.correlationId !== correlationId) return

            clearTimeout(timer)
            if (consumerCancel != null) {
              void channel.cancel(consumerCancel)
            }

            try {
              const reply = parseReply(msg.content)
              if (!reply.ok) {
                reject(
                  new AppError(
                    reply.error,
                    reply.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR
                  )
                )
                return
              }
              resolve({
                reply: reply.reply,
                ...(reply.audio != null ? { audio: reply.audio } : {})
              })
            } catch (error) {
              reject(
                error instanceof AppError
                  ? error
                  : new AppError(
                      'Invalid chat broker reply',
                      StatusCodes.INTERNAL_SERVER_ERROR
                    )
              )
            }
          },
          { noAck: true }
        )
        .then((ok) => {
          consumerCancel = ok.consumerTag
          const published = channel.sendToQueue(
            getChatQueueName(),
            Buffer.from(JSON.stringify(request)),
            {
              correlationId,
              replyTo: replyQueue.queue,
              persistent: true,
              contentType: 'application/json'
            }
          )
          if (!published) {
            clearTimeout(timer)
            void channel.cancel(ok.consumerTag)
            reject(
              new AppError(
                'Failed to enqueue chat message (broker buffer full)',
                StatusCodes.SERVICE_UNAVAILABLE
              )
            )
          } else {
            logger.info(`${LOG_PREFIX} enqueued source=${source} messageId=${messageId}`)
          }
        })
        .catch((error) => {
          clearTimeout(timer)
          reject(
            error instanceof AppError
              ? error
              : new AppError(
                  'Failed to enqueue chat message',
                  StatusCodes.SERVICE_UNAVAILABLE
                )
          )
        })
    })
  }

  /** @deprecated Prefer `requestChat` — kept as a web-specific alias. */
  static async requestWebChat(
    message: string,
    options?: ChatQueryOptions
  ): Promise<ChatQueryResponse> {
    return await ChatMessageBroker.requestChat(message, {
      ...options,
      source: 'web'
    })
  }
}
