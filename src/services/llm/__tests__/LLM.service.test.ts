import { ChatOpenAI } from '@langchain/openai'
import { ChatDeepSeek } from '@langchain/deepseek'
import { LLMService } from '../LLM.service'

jest.mock('../../../configs/appConfig', () => ({
  appConfigs: {
    llm: {
      openAIApiKey: 'test-openai-key',
      deepSeekApiKey: 'test-deepseek-key'
    }
  }
}))

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn()
}))

jest.mock('@langchain/deepseek', () => ({
  ChatDeepSeek: jest.fn()
}))

const ChatOpenAIMock = jest.mocked(ChatOpenAI)
const ChatDeepSeekMock = jest.mocked(ChatDeepSeek)

describe('LLMService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates ChatOpenAI with expected default config', () => {
    LLMService.create()

    expect(ChatOpenAIMock).toHaveBeenCalledWith({
      model: 'gpt-4o',
      temperature: 0,
      maxTokens: 500,
      apiKey: 'test-openai-key'
    })
  })

  it('creates ChatOpenAI with overrides', () => {
    LLMService.create({
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.2,
      maxTokens: 200
    })

    expect(ChatOpenAIMock).toHaveBeenCalledWith({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      maxTokens: 200,
      apiKey: 'test-openai-key'
    })
  })

  it('creates ChatDeepSeek when provider is deepseek', () => {
    LLMService.create({ provider: 'deepseek', model: 'deepseek-chat' })

    expect(ChatDeepSeekMock).toHaveBeenCalledWith({
      model: 'deepseek-chat',
      temperature: 0,
      maxTokens: 500,
      apiKey: 'test-deepseek-key'
    })
  })
})
