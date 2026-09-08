import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { LLMService } from '../../src/services/llm/LLM.service'
import type { EvalModelConfig } from '../config/models.config'

/**
 * Builds the exact BaseChatModel instance used for one evaluation call, via the
 * same LLMService.create() factory the production chat pipeline uses — no
 * provider-specific client code is duplicated here.
 */
export function buildEvalModel(config: EvalModelConfig): BaseChatModel {
  return LLMService.create({
    provider: config.provider,
    model: config.apiModel,
    // No temperature override — each provider's own default applies uniformly
    // across all three models under test (see models.config.ts / README §10).
    maxTokens: config.maxTokens
  })
}
