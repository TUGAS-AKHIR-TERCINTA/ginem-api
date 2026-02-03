import { ChatOpenAI } from '@langchain/openai'
import { appConfigs } from '../../configs'

export class LLMService {
  static create() {
    return new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
      maxTokens: 500,
      apiKey: appConfigs.llm.openAIApiKey
    })
  }
}
