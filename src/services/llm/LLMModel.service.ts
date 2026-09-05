import { Op, type WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'

import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'
import { sequelizeInit } from '../../configs/database'
import { LLMModelModel, type ILLMModelAttributes } from '../../models/LLMModelModel'
import { type IFindAllLLMModel } from '../../schemas/LLMModelSchema'

export class LLMModelService {
  private static buildFindAllWhere(payload: IFindAllLLMModel) {
    let where: WhereOptions<ILLMModelAttributes> = {
      deleted: 0
    }

    if (payload.search != null && payload.search.trim() !== '') {
      const term = `%${payload.search.trim()}%`
      where = {
        ...where,
        [Op.or]: [{ name: { [Op.like]: term } }, { provider: { [Op.like]: term } }]
      }
    }

    return where
  }

  static async findAll(options: IFindAllLLMModel) {
    try {
      const data = await LLMModelModel.findAll({
        where: this.buildFindAllWhere(options),
        order: [['name', 'asc']]
      })

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
      const model = await LLMModelModel.findOne({
        where: { deleted: 0, id }
      })

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
      const model = await LLMModelModel.findOne({
        where: { deleted: 0, id: modelId }
      })

      if (model == null) {
        throw AppError.notFound('LLM model not found')
      }

      await sequelizeInit.transaction(async (transaction) => {
        await LLMModelModel.update(
          { isSelected: false },
          { where: { deleted: 0, isSelected: true }, transaction }
        )

        await LLMModelModel.update(
          { isSelected: true },
          { where: { deleted: 0, id: modelId }, transaction }
        )
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[LLMModelService] selectModel failed: ${String(error)}`)
      throw new AppError('Failed to select LLM model', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async getSelectedModel() {
    try {
      const model = await LLMModelModel.findOne({
        where: { deleted: 0, isSelected: true }
      })

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
