import { StatusCodes } from 'http-status-codes'
import { ChatOpenAI } from '@langchain/openai'
import { appConfigs } from '../configs/appConfig'
import { AppError } from '../utilities/AppError'
import logger from '../utilities/logger'

export class LLMService {
  static create () {
    try {
      return new ChatOpenAI({
        model: 'gpt-4o',
        temperature: 0,
        maxTokens: 500,
        apiKey: appConfigs.llm?.openAIApiKey
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LLMService] create failed: ${String(serviceError)}`)
      throw new AppError('Failed to create LLM client', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
