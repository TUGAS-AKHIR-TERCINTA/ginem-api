import fs from 'fs'
import path from 'path'
import { StatusCodes } from 'http-status-codes'

import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'
import { type IFindAllLLMModel } from '../../schemas/LLMModelSchema'

interface LLMModel {
  id: string
  name: string
  provider: string
}

export class LLMModelService {
  private static readonly modelsPath = path.join(
    process.cwd(),
    'settings/llm-models.json'
  )
  private static readonly selectedPath = path.join(
    process.cwd(),
    'settings/selected-llm-model.json'
  )

  static async findAll(options: IFindAllLLMModel) {
    try {
      const { search } = options

      const raw = fs.readFileSync(this.modelsPath, 'utf-8')
      let data: LLMModel[] = JSON.parse(raw)

      if (search != null && search.trim() !== '') {
        const term = search.toLowerCase()
        data = data.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.provider.toLowerCase().includes(term)
        )
      }

      return {
        totalItems: data.length,
        items: data
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LLMModelService] findAll failed: ${String(serviceError)}`)
      throw new AppError('Failed to fetch LLM models', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findById(id: string) {
    try {
      const raw = fs.readFileSync(this.modelsPath, 'utf-8')
      const data: LLMModel[] = JSON.parse(raw)

      const model = data.find((item) => item.id === id)

      if (model == null) {
        throw AppError.notFound('LLM model not found')
      }

      return model
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LLMModelService] findById failed: ${String(serviceError)}`)
      throw new AppError('Failed to fetch LLM model', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async selectModel(modelId: string): Promise<void> {
    try {
      const raw = fs.readFileSync(this.modelsPath, 'utf-8')
      const models: LLMModel[] = JSON.parse(raw)

      const exists = models.find((m) => m.id === modelId)

      if (exists == null) {
        throw AppError.notFound('LLM model not found')
      }

      fs.writeFileSync(this.selectedPath, JSON.stringify({ modelId }, null, 2), 'utf-8')
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[LLMModelService] selectModel failed: ${String(error)}`)
      throw new AppError('Failed to select LLM model', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async getSelectedModel(): Promise<LLMModel> {
    try {
      const rawSelected = fs.readFileSync(this.selectedPath, 'utf-8')
      const { modelId } = JSON.parse(rawSelected)

      const rawModels = fs.readFileSync(this.modelsPath, 'utf-8')
      const models: LLMModel[] = JSON.parse(rawModels)

      const model = models.find((m) => m.id === modelId)

      if (model == null) {
        throw AppError.notFound('Selected model not found')
      }

      return model
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[LLMModelService] getSelectedModel failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to get selected model',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
