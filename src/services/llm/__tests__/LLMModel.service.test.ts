import { StatusCodes } from 'http-status-codes'
import { LLMModelModel } from '../../../models/LLMModelModel'
import { LLMModelService } from '../LLMModel.service'

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../../../configs/database', () => ({
  sequelizeInit: {
    transaction: jest.fn(async (callback: (t: unknown) => Promise<void>) => {
      await callback({})
    })
  }
}))

jest.mock('../../../models/LLMModelModel', () => ({
  LLMModelModel: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn()
  }
}))

const mockedLLMModelModel = LLMModelModel as jest.Mocked<typeof LLMModelModel>

const models = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', isSelected: true },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', isSelected: false },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', isSelected: false }
]

describe('LLMModelService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('returns all models without search', async () => {
      mockedLLMModelModel.findAll.mockResolvedValue(models as never)

      const result = await LLMModelService.findAll({})

      expect(result.totalItems).toBe(3)
      expect(result.items).toHaveLength(3)
    })

    it('filters models by search term', async () => {
      mockedLLMModelModel.findAll.mockResolvedValue([models[2]] as never)

      const result = await LLMModelService.findAll({ search: 'deepseek' })

      expect(result.totalItems).toBe(1)
      expect(result.items[0].id).toBe('deepseek-chat')
    })
  })

  describe('findById', () => {
    it('returns model by id', async () => {
      mockedLLMModelModel.findOne.mockResolvedValue(models[1] as never)

      const result = await LLMModelService.findById('gpt-4o')

      expect(result.name).toBe('GPT-4o')
    })

    it('throws not found for unknown model', async () => {
      mockedLLMModelModel.findOne.mockResolvedValue(null)

      await expect(LLMModelService.findById('missing')).rejects.toMatchObject({
        message: 'LLM model not found',
        statusCode: StatusCodes.NOT_FOUND
      })
    })
  })

  describe('selectModel', () => {
    it('marks the target model as selected', async () => {
      mockedLLMModelModel.findOne.mockResolvedValue(models[1] as never)
      mockedLLMModelModel.update.mockResolvedValue([1] as never)

      await LLMModelService.selectModel('gpt-4o')

      expect(mockedLLMModelModel.update).toHaveBeenCalledWith(
        { isSelected: false },
        expect.objectContaining({ where: { deleted: 0, isSelected: true } })
      )
      expect(mockedLLMModelModel.update).toHaveBeenCalledWith(
        { isSelected: true },
        expect.objectContaining({ where: { deleted: 0, id: 'gpt-4o' } })
      )
    })

    it('throws not found for unknown model', async () => {
      mockedLLMModelModel.findOne.mockResolvedValue(null)

      await expect(LLMModelService.selectModel('missing')).rejects.toMatchObject({
        message: 'LLM model not found',
        statusCode: StatusCodes.NOT_FOUND
      })
    })
  })

  describe('getSelectedModel', () => {
    it('returns currently selected model', async () => {
      mockedLLMModelModel.findOne.mockResolvedValue(models[0] as never)

      const result = await LLMModelService.getSelectedModel()

      expect(result.id).toBe('gpt-4')
    })

    it('throws not found when no model is selected', async () => {
      mockedLLMModelModel.findOne.mockResolvedValue(null)

      await expect(LLMModelService.getSelectedModel()).rejects.toMatchObject({
        message: 'Selected model not found',
        statusCode: StatusCodes.NOT_FOUND
      })
    })
  })
})
