jest.mock('../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}))

import fs from 'fs'
import { StatusCodes } from 'http-status-codes'
import { LLMModelService } from '../LLMModel.service'

const mockedFs = fs as jest.Mocked<typeof fs>

const models = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek' }
]

describe('LLMModelService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedFs.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      const path = String(filePath)
      if (path.includes('selected-llm-model')) {
        return JSON.stringify({ modelId: 'gpt-4' })
      }
      return JSON.stringify(models)
    })
  })

  describe('findAll', () => {
    it('returns all models without search', async () => {
      const result = await LLMModelService.findAll({})

      expect(result.totalItems).toBe(3)
      expect(result.items).toHaveLength(3)
    })

    it('filters models by search term', async () => {
      const result = await LLMModelService.findAll({ search: 'deepseek' })

      expect(result.totalItems).toBe(1)
      expect(result.items[0].id).toBe('deepseek-chat')
    })
  })

  describe('findById', () => {
    it('returns model by id', async () => {
      const result = await LLMModelService.findById('gpt-4o')

      expect(result.name).toBe('GPT-4o')
    })

    it('throws not found for unknown model', async () => {
      await expect(LLMModelService.findById('missing')).rejects.toMatchObject({
        message: 'LLM model not found',
        statusCode: StatusCodes.NOT_FOUND
      })
    })
  })

  describe('selectModel', () => {
    it('writes selected model id to file', async () => {
      await LLMModelService.selectModel('gpt-4o')

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('selected-llm-model.json'),
        JSON.stringify({ modelId: 'gpt-4o' }, null, 2),
        'utf-8'
      )
    })
  })

  describe('getSelectedModel', () => {
    it('returns currently selected model', async () => {
      const result = await LLMModelService.getSelectedModel()

      expect(result.id).toBe('gpt-4')
    })
  })
})
