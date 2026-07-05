import { StatusCodes } from 'http-status-codes'
import { IndexingModel } from '../../models/IndexingModel'
import { pineconeService } from '../Pinecone.service'
import { PineconeBackupService } from '../PineconeBackup.service'

jest.mock('../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../Pinecone.service', () => ({
  pineconeService: {
    deleteByContentAndSource: jest.fn()
  }
}))

jest.mock('../../models/IndexingModel', () => ({
  IndexingModel: {
    bulkCreate: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  }
}))

const mockedIndexingModel = IndexingModel as jest.Mocked<typeof IndexingModel>
const mockedPinecone = pineconeService as jest.Mocked<typeof pineconeService>

describe('PineconeBackupService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveIndexingBackup', () => {
    it('skips when documents array is empty', async () => {
      await PineconeBackupService.saveIndexingBackup([])

      expect(mockedIndexingModel.bulkCreate).not.toHaveBeenCalled()
    })

    it('persists documents to database', async () => {
      mockedIndexingModel.bulkCreate.mockResolvedValue([] as never)

      await PineconeBackupService.saveIndexingBackup([
        { text: 'Chunk A', source: 'text' }
      ])

      expect(mockedIndexingModel.bulkCreate).toHaveBeenCalledWith([
        {
          content: 'Chunk A',
          source: 'text',
          sourceType: 'json'
        }
      ])
    })
  })

  describe('findAllIndexings', () => {
    it('returns paginated indexings', async () => {
      mockedIndexingModel.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ indexingId: 1 }]
      } as never)

      const result = await PineconeBackupService.findAllIndexings({
        page: 1,
        size: 10,
        pagination: true,
        source: undefined,
        search: undefined
      })

      expect(result.totalItems).toBe(1)
    })
  })

  describe('deleteIndexingById', () => {
    it('throws not found when backup row is missing', async () => {
      mockedIndexingModel.findByPk.mockResolvedValue(null)

      await expect(PineconeBackupService.deleteIndexingById(99)).rejects.toMatchObject({
        message: 'Indexing tidak ditemukan di database.',
        statusCode: StatusCodes.NOT_FOUND
      })
    })

    it('deletes backup and pinecone record', async () => {
      mockedIndexingModel.findByPk.mockResolvedValue({
        content: 'docs',
        source: 'manual'
      } as never)
      mockedIndexingModel.destroy.mockResolvedValue(1 as never)
      mockedPinecone.deleteByContentAndSource.mockResolvedValue({ deleted: 1 })

      await expect(PineconeBackupService.deleteIndexingById(1)).resolves.toBe(true)

      expect(mockedPinecone.deleteByContentAndSource).toHaveBeenCalledWith(
        'docs',
        'manual'
      )
    })
  })
})
