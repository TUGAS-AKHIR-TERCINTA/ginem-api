import { Op } from 'sequelize'
import { pineconeService } from './Pinecone.service'
import logger from '../../utilities/logger'
import { StatusCodes } from 'http-status-codes'
import { Pagination } from '../../utilities/pagination'
import { IndexingModel, type IndexingSourceType } from '../../models/IndexingModel'
import { AppError } from '../../utilities/AppError'
import { type ICreateIndexing, type IFindAllIndexing } from '../../schemas/IndexingSchema'

export interface IndexingDocument {
  content: string
  source?: string
}

export class PineconeBackupService {
  static async saveIndexingBackup(
    documents: ICreateIndexing[],
    sourceType: IndexingSourceType = 'json'
  ): Promise<void> {
    try {
      if (documents.length === 0) return

      await IndexingModel.bulkCreate(
        documents.map((doc) => ({
          content: doc.text,
          source: doc.source,
          sourceType
        }))
      )
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PineconeBackupService] saveIndexingBackup failed: ${String(error)}`)
      throw new AppError(
        'Failed to save indexing backup',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findAllIndexings(params: IFindAllIndexing) {
    try {
      const { page, size, pagination, source, search } = params

      const parsedPage = Number(page)
      const parsedSize = Number(size)
      const pager = new Pagination(
        Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
        Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : 10
      )

      const where: Record<string, unknown> = {}

      if (source != null && String(source).trim() !== '') {
        where.source = { [Op.like]: `%${String(source).trim()}%` }
      }

      if (search != null && String(search).trim() !== '') {
        const term = `%${String(search).trim()}%`
        const orCondition = [
          { content: { [Op.like]: term } },
          { source: { [Op.like]: term } }
        ]
        Object.assign(where, { [Op.or]: orCondition })
      }

      const result = await IndexingModel.findAndCountAll({
        where: where as any,
        order: [['indexingId', 'DESC']],
        ...(pagination && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PineconeBackupService] findAllIndexings failed: ${String(error)}`)
      throw new AppError(
        'Failed to find all indexings',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async deleteIndexingById(indexingId: number): Promise<boolean> {
    try {
      const row = await IndexingModel.findByPk(indexingId)
      if (row == null) {
        throw AppError.notFound('Indexing tidak ditemukan di database.')
      }

      const content = row.content
      const source = row.source ?? ''

      await IndexingModel.destroy({ where: { indexingId } })

      const { deleted } = await pineconeService.deleteByContentAndSource(content, source)
      if (deleted === 0) {
        throw AppError.notFound(
          'Indexing di Pinecone tidak ditemukan atau data tidak cocok dengan backup.'
        )
      }

      return true
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PineconeBackupService] deleteIndexingById failed: ${String(error)}`)
      throw new AppError(
        'Failed to delete indexing by id',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
