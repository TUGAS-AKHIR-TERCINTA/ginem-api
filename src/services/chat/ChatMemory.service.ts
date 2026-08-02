import { StatusCodes } from 'http-status-codes'

import {
  ChatMessageModel,
  type ChatMessageRole,
  type ChatMessageSource,
  type IChatMessageAttributes
} from '../../models/ChatMessageModel'
import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'

export const CHAT_MEMORY_RECENT_LIMIT = 10

export interface ChatMemoryTurn {
  role: ChatMessageRole
  content: string
}

export interface ChatMemoryScope {
  userId: number
  sessionId: string
  source: ChatMessageSource
}

/**
 * Short-term chat memory backed by MySQL (recent turns by time).
 * Pinecone remains for knowledge-base RAG only.
 */
export class ChatMemoryService {
  static async getRecent(
    scope: Pick<ChatMemoryScope, 'userId' | 'sessionId'>,
    limit: number = CHAT_MEMORY_RECENT_LIMIT
  ): Promise<ChatMemoryTurn[]> {
    try {
      const rows = await ChatMessageModel.findAll({
        where: {
          deleted: 0,
          userId: scope.userId,
          sessionId: scope.sessionId
        },
        attributes: ['role', 'content', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit
      })

      // Oldest → newest for prompt construction
      return rows
        .slice()
        .reverse()
        .map((row) => ({
          role: row.role,
          content: row.content
        }))
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ChatMemoryService] getRecent failed: ${String(serviceError)}`)
      throw new AppError('Failed to load chat memory', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async appendMessage(
    scope: ChatMemoryScope,
    role: ChatMessageRole,
    content: string
  ): Promise<IChatMessageAttributes> {
    try {
      const trimmed = content.trim()
      if (trimmed === '') {
        throw AppError.badRequest('Chat memory content is required')
      }

      const created = await ChatMessageModel.create({
        userId: scope.userId,
        sessionId: scope.sessionId,
        role,
        content: trimmed,
        source: scope.source,
        deleted: false
      })

      return created.get({ plain: true })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ChatMemoryService] appendMessage failed: ${String(serviceError)}`)
      throw new AppError('Failed to save chat memory', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async appendTurn(
    scope: ChatMemoryScope,
    userMessage: string,
    assistantMessage: string
  ): Promise<void> {
    await ChatMemoryService.appendMessage(scope, 'user', userMessage)
    await ChatMemoryService.appendMessage(scope, 'assistant', assistantMessage)
  }
}
