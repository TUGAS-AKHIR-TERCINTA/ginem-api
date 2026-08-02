import { StatusCodes } from 'http-status-codes'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatOpenAI } from '@langchain/openai'
import { ChatDeepSeek } from '@langchain/deepseek'
import { appConfigs } from '../../configs/appConfig'
import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'

export type LLMProvider = 'openai' | 'deepseek'

export interface LLMCreateOptions {
  /** Defaults to openai (production path). */
  provider?: LLMProvider
  /** Defaults to gpt-4o for openai, deepseek-chat for deepseek. */
  model?: string
  temperature?: number
  maxTokens?: number
  /** Override API key; otherwise uses appConfigs / env. */
  apiKey?: string
}

/**
 * Factory for LangChain chat models.
 * `create()` with no args preserves the production default (OpenAI gpt-4o).
 */
export class LLMService {
  static create(options?: LLMCreateOptions): BaseChatModel {
    try {
      const provider = options?.provider ?? 'openai'
      const temperature = options?.temperature ?? 0
      const maxTokens = options?.maxTokens ?? 500

      if (provider === 'deepseek') {
        const apiKey =
          options?.apiKey ??
          appConfigs.llm?.deepSeekApiKey ??
          appConfigs.llm?.openAIApiKey
        if (apiKey == null || apiKey === '') {
          throw new AppError(
            'DeepSeek API key is not configured',
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        }
        return new ChatDeepSeek({
          model: options?.model ?? 'deepseek-chat',
          temperature,
          maxTokens,
          apiKey
        })
      }

      if (provider !== 'openai') {
        throw new AppError(
          `Unsupported LLM provider: ${String(provider)}`,
          StatusCodes.BAD_REQUEST
        )
      }

      const apiKey = options?.apiKey ?? appConfigs.llm?.openAIApiKey
      return new ChatOpenAI({
        model: options?.model ?? 'gpt-4o',
        temperature,
        maxTokens,
        apiKey
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LLMService] create failed: ${String(serviceError)}`)
      throw new AppError('Failed to create LLM client', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
