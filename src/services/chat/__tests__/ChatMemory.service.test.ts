import { StatusCodes } from 'http-status-codes'

import { ChatMessageModel } from '../../../models/ChatMessageModel'
import { ChatMemoryService } from '../ChatMemory.service'

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../../../models/ChatMessageModel', () => ({
  ChatMessageModel: {
    findAll: jest.fn(),
    create: jest.fn()
  }
}))

const mockedChatMessageModel = ChatMessageModel as unknown as {
  findAll: jest.Mock
  create: jest.Mock
}

describe('ChatMemoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getRecent', () => {
    it('returns oldest-to-newest turns up to the limit', async () => {
      mockedChatMessageModel.findAll.mockResolvedValue([
        { role: 'assistant', content: 'Siap, lampu dinyalakan.' },
        { role: 'user', content: 'Nyalakan lampu' }
      ])

      const result = await ChatMemoryService.getRecent({
        userId: 1,
        sessionId: 'web:1'
      })

      expect(mockedChatMessageModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deleted: 0, userId: 1, sessionId: 'web:1' },
          order: [['createdAt', 'DESC']],
          limit: 10
        })
      )
      expect(result).toEqual([
        { role: 'user', content: 'Nyalakan lampu' },
        { role: 'assistant', content: 'Siap, lampu dinyalakan.' }
      ])
    })
  })

  describe('appendTurn', () => {
    it('persists user then assistant messages', async () => {
      mockedChatMessageModel.create
        .mockResolvedValueOnce({
          get: () => ({
            chatMessageId: 1,
            role: 'user',
            content: 'Halo'
          })
        })
        .mockResolvedValueOnce({
          get: () => ({
            chatMessageId: 2,
            role: 'assistant',
            content: 'Halo juga'
          })
        })

      await ChatMemoryService.appendTurn(
        { userId: 1, sessionId: 'web:1', source: 'web' },
        'Halo',
        'Halo juga'
      )

      expect(mockedChatMessageModel.create).toHaveBeenNthCalledWith(1, {
        userId: 1,
        sessionId: 'web:1',
        role: 'user',
        content: 'Halo',
        source: 'web',
        deleted: false
      })
      expect(mockedChatMessageModel.create).toHaveBeenNthCalledWith(2, {
        userId: 1,
        sessionId: 'web:1',
        role: 'assistant',
        content: 'Halo juga',
        source: 'web',
        deleted: false
      })
    })

    it('rejects blank content', async () => {
      await expect(
        ChatMemoryService.appendMessage(
          { userId: 1, sessionId: 'web:1', source: 'web' },
          'user',
          '   '
        )
      ).rejects.toMatchObject({
        message: 'Chat memory content is required',
        statusCode: StatusCodes.BAD_REQUEST
      })
    })
  })
})
