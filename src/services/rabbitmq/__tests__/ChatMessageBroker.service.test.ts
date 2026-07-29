import { StatusCodes } from 'http-status-codes'

import { ChatMessageBroker } from '../ChatMessageBroker.service'
import { ChatService } from '../../chat'
import * as rabbitConnection from '../connection'

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() }
}))

jest.mock('../../chat', () => ({
  ChatService: {
    query: jest.fn()
  }
}))

jest.mock('../connection', () => ({
  getRabbitChannel: jest.fn(),
  getChatQueueName: jest.fn(() => 'chat.llm.requests'),
  closeRabbitConnection: jest.fn()
}))

jest.mock('../../../configs/appConfig', () => ({
  appConfigs: {
    rabbitmq: {
      url: 'amqp://guest:guest@127.0.0.1:5672',
      chatQueue: 'chat.llm.requests',
      chatReplyTimeoutMs: 5000
    }
  }
}))

const mockedChatService = ChatService as jest.Mocked<typeof ChatService>
const mockedGetChannel = rabbitConnection.getRabbitChannel as jest.Mock

async function flushMicrotasks (): Promise<void> {
  await new Promise<void>((resolve) => {
    setImmediate(resolve)
  })
}

async function waitForMockCalls (fn: jest.Mock, count = 1): Promise<void> {
  for (let i = 0; i < 30; i++) {
    if (fn.mock.calls.length >= count) return
    await flushMicrotasks()
  }
  throw new Error(`Timed out waiting for mock to be called ${count} time(s)`)
}

describe('ChatMessageBroker', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await ChatMessageBroker.shutdown()
  })

  it('requestChat publishes to the queue and resolves RPC reply', async () => {
    const sendToQueue = jest.fn().mockReturnValue(true)
    const cancel = jest.fn().mockResolvedValue(undefined)
    let replyHandler: ((msg: unknown) => void) | undefined

    const channel = {
      assertQueue: jest.fn().mockResolvedValue({ queue: 'amq.gen-reply' }),
      consume: jest.fn().mockImplementation(async (_queue, onMessage) => {
        replyHandler = onMessage
        return { consumerTag: 'tag-1' }
      }),
      sendToQueue,
      cancel
    }

    mockedGetChannel.mockResolvedValue(channel)

    const pending = ChatMessageBroker.requestChat('Nyalakan lampu', { source: 'web' })
    await waitForMockCalls(sendToQueue)

    expect(sendToQueue).toHaveBeenCalledWith(
      'chat.llm.requests',
      expect.any(Buffer),
      expect.objectContaining({
        replyTo: 'amq.gen-reply',
        persistent: true
      })
    )

    const publishOpts = sendToQueue.mock.calls[0][2] as { correlationId: string }
    replyHandler?.({
      properties: { correlationId: publishOpts.correlationId },
      content: Buffer.from(
        JSON.stringify({
          messageId: 'm1',
          ok: true,
          reply: 'Lampu dinyalakan.'
        })
      )
    })

    await expect(pending).resolves.toEqual({ reply: 'Lampu dinyalakan.' })
  })

  it('requestChat rejects when broker reply is an error payload', async () => {
    const sendToQueue = jest.fn().mockReturnValue(true)
    let replyHandler: ((msg: unknown) => void) | undefined

    const channel = {
      assertQueue: jest.fn().mockResolvedValue({ queue: 'amq.gen-reply' }),
      consume: jest.fn().mockImplementation(async (_queue, onMessage) => {
        replyHandler = onMessage
        return { consumerTag: 'tag-2' }
      }),
      sendToQueue,
      cancel: jest.fn().mockResolvedValue(undefined)
    }

    mockedGetChannel.mockResolvedValue(channel)

    const pending = ChatMessageBroker.requestChat('Hello', { source: 'whatsapp' })
    await waitForMockCalls(sendToQueue)

    const publishOpts = sendToQueue.mock.calls[0][2] as { correlationId: string }
    replyHandler?.({
      properties: { correlationId: publishOpts.correlationId },
      content: Buffer.from(
        JSON.stringify({
          messageId: 'm2',
          ok: false,
          error: 'LLM down',
          statusCode: StatusCodes.BAD_GATEWAY
        })
      )
    })

    await expect(pending).rejects.toMatchObject({
      message: 'LLM down',
      statusCode: StatusCodes.BAD_GATEWAY
    })
  })

  it('consumer path calls ChatService.query for queued work', async () => {
    mockedChatService.query.mockResolvedValue({ reply: 'ok' })

    const ack = jest.fn()
    const sendToQueue = jest.fn().mockReturnValue(true)
    let queueHandler: ((msg: unknown) => void) | undefined

    const channel = {
      consume: jest.fn().mockImplementation(async (_queue, onMessage) => {
        queueHandler = onMessage
        return { consumerTag: 'worker-1' }
      }),
      sendToQueue,
      ack,
      cancel: jest.fn()
    }

    mockedGetChannel.mockResolvedValue(channel)
    await ChatMessageBroker.initialize()

    const request = {
      messageId: 'm3',
      source: 'web',
      message: 'status lampu'
    }

    queueHandler?.({
      content: Buffer.from(JSON.stringify(request)),
      properties: {
        replyTo: 'amq.gen-reply',
        correlationId: 'corr-1'
      }
    })

    await waitForMockCalls(sendToQueue)
    await waitForMockCalls(ack)

    expect(mockedChatService.query).toHaveBeenCalledWith('status lampu', {
      withAudio: false
    })
    expect(sendToQueue).toHaveBeenCalledWith(
      'amq.gen-reply',
      expect.any(Buffer),
      expect.objectContaining({ correlationId: 'corr-1' })
    )
    expect(ack).toHaveBeenCalled()
  })
})
