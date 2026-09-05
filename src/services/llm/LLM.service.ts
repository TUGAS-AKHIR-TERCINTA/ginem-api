import { StatusCodes } from 'http-status-codes'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatOpenAI } from '@langchain/openai'
import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatAnthropic } from '@langchain/anthropic'
import { appConfigs } from '../../configs/appConfig'
import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'

export type LLMProvider = 'openai' | 'deepseek' | 'anthropic'

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

      if (provider === 'anthropic') {
        const apiKey = options?.apiKey ?? appConfigs.llm?.anthropicApiKey
        if (apiKey == null || apiKey === '') {
          throw new AppError(
            'Anthropic API key is not configured',
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        }
        return new ChatAnthropic({
          model: options?.model ?? 'claude-sonnet-4-5',
          // `temperature` is rejected outright by some Anthropic model ids ("temperature
          // is deprecated for this model") — omit it and let the API use its default.
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
        apiKey,
        // LangChain auto-detects any "gpt-5*" model name as a reasoning model and may
        // send a reasoning_effort the API rejects when function tools are used on
        // /v1/chat/completions. Forcing 'none' keeps tool calling on that endpoint working;
        // it's a no-op for non-reasoning models.
        reasoning: { effort: 'none' }
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LLMService] create failed: ${String(serviceError)}`)
      throw new AppError('Failed to create LLM client', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
