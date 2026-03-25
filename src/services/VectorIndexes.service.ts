import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { VectorIndexesModel, VectorIndexSource } from '../models/VectorIndexesModel'
import type { VectorIndexesInstance } from '../models/VectorIndexesModel'
import { AppError } from '../utilities/AppError'
import { Pagination } from '../utilities/pagination'
import logger from '../utilities/logger'

export interface FindAllVectorIndexesParams {
  page?: number
  size?: number
  pagination?: boolean | null
  source?: VectorIndexSource | string | null
  search?: string | null
}

export interface PaginatedVectorIndexesResult {
  totalItems: number
  items: VectorIndexesInstance[]
  totalPages: number
  currentPage: number
}

/**
 * Vector indexes service: list records from vector_indexes table with pagination.
 */
export class VectorIndexesService {
  static async findAll(
    params: FindAllVectorIndexesParams
  ): Promise<PaginatedVectorIndexesResult> {
    try {
      const page = params.page ?? 1
      const size = params.size ?? 20
      const pager = new Pagination(page, size)

      const where: Record<string, unknown> = {}

      if (params.source && (params.source === 'pdf' || params.source === 'text')) {
        where.vectorIndexSource = params.source
      }

      if (params.search && String(params.search).trim()) {
        const term = `%${String(params.search).trim()}%`
        where.vectorIndexText = { [Op.like]: term }
      }

      const result = await VectorIndexesModel.findAndCountAll({
        where,
        order: [['vectorIndexId', 'DESC']],
        ...(params.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[VectorIndexesService] findAll failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch vector indexes',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
