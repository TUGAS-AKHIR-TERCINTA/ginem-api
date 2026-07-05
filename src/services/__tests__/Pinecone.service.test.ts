import { pineconeService } from '../Pinecone.service'

jest.mock('../../configs/appConfig', () => ({
  appConfigs: {
    pinecone: {
      apiKey: 'test-pinecone-key',
      indexName: 'test-index',
      namespace: 'test-namespace',
      embeddingModel: 'text-embedding-3-small'
    },
    llm: { openAIApiKey: 'test-openai-key' }
  }
}))

jest.mock('../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('axios')
jest.mock('@pinecone-database/pinecone', () => ({
  Pinecone: jest.fn()
}))

describe('PineconeService', () => {
  it('returns empty array for blank search query', async () => {
    await expect(pineconeService.search('')).resolves.toEqual([])
    await expect(pineconeService.search('   ')).resolves.toEqual([])
  })

  it('returns zero deleted count for empty content', async () => {
    await expect(pineconeService.deleteByContentAndSource('', 'manual')).resolves.toEqual({
      deleted: 0
    })
  })

  it('skips addDocuments when documents array is empty', async () => {
    await expect(pineconeService.addDocuments([])).resolves.toBeUndefined()
  })
})
