import { ChatOpenAI } from '@langchain/openai'
import { ChatDeepSeek } from '@langchain/deepseek'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { ModelConfig } from '../lib/paths'

export interface BoundModel {
  modelId: string
  config: ModelConfig
  llm: BaseChatModel
}

/**
 * Create a LangChain chat model from configurable JSON model entries.
 * Does not execute tools — callers bind tools and inspect raw tool_calls only.
 */
export function createChatModel(config: ModelConfig): BaseChatModel {
  const common = {
    model: config.modelName,
    temperature: config.temperature,
    maxTokens: config.maxTokens
  }

  switch (config.provider) {
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error(
          `Missing OPENAI_API_KEY for model ${config.id} (${config.modelName})`
        )
      }
      return new ChatOpenAI({ ...common, apiKey })
    }
    case 'deepseek': {
      const apiKey = process.env.DEEPSEEK_API_KEY ?? process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error(
          `Missing DEEPSEEK_API_KEY (or OPENAI_API_KEY) for model ${config.id}`
        )
      }
      return new ChatDeepSeek({ ...common, apiKey })
    }
    default:
      throw new Error(`Unsupported provider "${config.provider}" for model ${config.id}`)
  }
}

export function createBoundModels(configs: ModelConfig[]): BoundModel[] {
  return configs.map((config) => ({
    modelId: config.id,
    config,
    llm: createChatModel(config)
  }))
}
