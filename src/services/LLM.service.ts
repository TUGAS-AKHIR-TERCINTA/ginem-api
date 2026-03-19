import { StatusCodes } from 'http-status-codes'
import { ChatOpenAI } from '@langchain/openai'
import { appConfigs } from '../configs'
import { AppError } from '../utilities/AppError'
import logger from '../../logs'

export class LLMService {
  static create() {
    try {
      return new ChatOpenAI({
        model: 'gpt-4o',
        temperature: 0,
        maxTokens: 500,
        apiKey: appConfigs.llm?.openAIApiKey
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[LLMService] create failed: ${String(error)}`)
      throw new AppError('Failed to create LLM client', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
