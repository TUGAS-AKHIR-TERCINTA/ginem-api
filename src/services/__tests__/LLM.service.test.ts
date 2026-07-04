import { ChatOpenAI } from '@langchain/openai'
import { LLMService } from '../LLM.service'

jest.mock('../../configs/appConfig', () => ({
  appConfigs: {
    llm: { openAIApiKey: 'test-openai-key' }
  }
}))

jest.mock('../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn()
}))

const ChatOpenAIMock = jest.mocked(ChatOpenAI)

describe('LLMService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates ChatOpenAI with expected config', () => {
    LLMService.create()

    expect(ChatOpenAIMock).toHaveBeenCalledWith({
      model: 'gpt-4o',
      temperature: 0,
      maxTokens: 500,
      apiKey: 'test-openai-key'
    })
  })
})
