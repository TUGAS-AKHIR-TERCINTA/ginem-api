import axios from 'axios'
import crypto from 'crypto'
import logger from '../utilities/logger'
import { StatusCodes } from 'http-status-codes'
import { Pinecone } from '@pinecone-database/pinecone'
import { appConfigs } from '../configs/appConfig'
import { AppError } from '../utilities/AppError'
import { ICreateIndexing } from '../schemas/IndexingSchema'

export type RagDocument = { content: string; source?: string }
export type IndexPdfResult = { indexed: number; source: string }

const DEFAULT_SEARCH_LIMIT = 5

type PineconeVectorMetadata = {
  content: string
  source: string
}

class PineconeService {
  private client: Pinecone | null = null
  private indexName: string
  private namespace: string
  private indexDimension: number | null = null

  constructor() {
    this.indexName = appConfigs.pinecone.indexName ?? 'neuroai'
    this.namespace = appConfigs.pinecone.namespace ?? '__default__'
  }

  private async getClient(): Promise<Pinecone> {
    if (this.client) return this.client

    const apiKey = appConfigs.pinecone.apiKey ?? ''
    if (!apiKey) {
      throw new AppError(
        'Pinecone is not configured. Missing PINECONE_API_KEY.',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }

    const controllerHostUrl =
      process.env.PINECONE_CONTROLLER_HOST_URL ??
      process.env.PINECONE_CONTROLLER_HOST ??
      undefined

    this.client = new Pinecone({
      apiKey,
      ...(controllerHostUrl ? { controllerHostUrl } : {})
    })

    return this.client
  }

  private static sha256(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex')
  }

  private static isTransientPineconeError(error: unknown): boolean {
    const message = String(error ?? '').toLowerCase()
    return (
      message.includes('status code 502') ||
      message.includes('bad gateway') ||
      message.includes('status code 503') ||
      message.includes('service unavailable') ||
      message.includes('status code 504') ||
      message.includes('gateway timeout')
    )
  }

  private static async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async embedTexts(texts: string[]): Promise<number[][]> {
    const openaiKey = appConfigs.llm.openAIApiKey
    if (!openaiKey) {
      throw new AppError('OPENAI_API_KEY is not set', StatusCodes.INTERNAL_SERVER_ERROR)
    }

    const model = appConfigs.pinecone.embeddingModel ?? 'text-embedding-3-small'

    // If Pinecone index was created with a reduced dimension (e.g. 1024),
    // align OpenAI embedding dimension with that index dimension.
    const dimensions =
      this.indexDimension && String(model).includes('text-embedding-3')
        ? this.indexDimension
        : undefined

    const resp = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        model,
        input: texts,
        ...(dimensions ? { dimensions } : {})
      },
      {
        headers: {
          Authorization: `Bearer ${openaiKey}`
        }
      }
    )

    const embeddings = resp.data?.data?.map((d: any) => d.embedding) as unknown
    if (!Array.isArray(embeddings)) {
      throw new AppError(
        'Failed to generate embeddings',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
    const embeddedVectors = embeddings as number[][]
    if (
      typeof this.indexDimension === 'number' &&
      embeddedVectors[0] &&
      embeddedVectors[0].length !== this.indexDimension
    ) {
      throw new AppError(
        `[PineconeService] Embedding dimension mismatch: got ${embeddedVectors[0].length}, expected index dimension ${this.indexDimension}. Check PINECONE_EMBEDDING_MODEL and index settings.`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }

    return embeddedVectors
  }

  private async getIndex() {
    const client = await this.getClient()
    try {
      const indexModel = await client.describeIndex(this.indexName)
      this.indexDimension =
        typeof (indexModel as any)?.dimension === 'number'
          ? (indexModel as any).dimension
          : typeof (indexModel as any)?.spec?.dimension === 'number'
            ? (indexModel as any).spec.dimension
            : null
      return client.index<PineconeVectorMetadata>({ host: indexModel.host })
    } catch (error) {
      // Help with configuration issues (wrong index name).
      const indexList = await client.listIndexes()
      const available = indexList?.indexes?.map((i: any) => i.name).filter(Boolean) ?? []

      // Auto-fallback if there's exactly one index.
      if (available.length === 1) {
        this.indexName = available[0]
        const indexModel = await client.describeIndex(this.indexName)
        this.indexDimension =
          typeof (indexModel as any)?.dimension === 'number'
            ? (indexModel as any).dimension
            : typeof (indexModel as any)?.spec?.dimension === 'number'
              ? (indexModel as any).spec.dimension
              : null
        return client.index<PineconeVectorMetadata>({ host: indexModel.host })
      }

      logger.error(
        `[PineconeService] Index not found: ${this.indexName}. Available: ${
          available.join(', ') || '(none)'
        }`
      )
      throw new AppError(
        `Pinecone index not found: ${this.indexName}. Set PINECONE_INDEX_NAME to an existing index.`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async addDocuments(documents: ICreateIndexing[]): Promise<void> {
    try {
      if (documents.length === 0) return

      const index = await this.getIndex()
      logger.info(
        `[PineconeService] addDocuments -> index=${this.indexName}, namespace=${this.namespace}, docs=${documents.length}`
      )

      // Batch embeddings to keep payload size reasonable.
      const batchSize = 50
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize)
        const texts = batch.map((d) => d.text)
        const vectors = await this.embedTexts(texts)

        const records = batch.map((d, idx) => {
          const source = d.source ?? ''
          const content = d.text
          const id = PineconeService.sha256(`${source}:${content}`)
          return {
            id,
            values: vectors[idx],
            metadata: {
              content,
              source
            }
          }
        })

        await index.upsert({ records, namespace: this.namespace })

        // Verify at least one record is readable right after upsert.
        // This helps detect misconfigured namespace/index.
        const first = records[0]
        if (first?.id) {
          const fetched = await index.fetch({
            ids: [first.id],
            namespace: this.namespace
          })
          const found = fetched?.records?.[first.id] != null
          logger.info(
            `[PineconeService] upsert verify -> index=${this.indexName}, namespace=${this.namespace}, id=${first.id.slice(0, 10)}..., found=${found}`
          )
        }
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PineconeService] addDocuments failed: ${String(error)}`)
      throw new AppError(
        'Failed to add documents to Pinecone',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  async search(
    query: string,
    limit: number = DEFAULT_SEARCH_LIMIT
  ): Promise<RagDocument[]> {
    if (!query.trim()) return []

    const maxAttempts = 3
    let lastError: unknown = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const index = await this.getIndex()
        const vectors = await this.embedTexts([query])
        const vector = vectors[0]

        const result = await index.query({
          vector,
          topK: limit,
          includeMetadata: true,
          namespace: this.namespace
        })

        const matches = result.matches ?? []
        return matches
          .map((m) => {
            const metadata = m.metadata as PineconeVectorMetadata | undefined
            if (!metadata) return null
            return {
              content: metadata.content,
              source: metadata.source || undefined
            }
          })
          .filter(Boolean) as RagDocument[]
      } catch (error) {
        lastError = error

        if (error instanceof AppError) throw error

        const isTransient = PineconeService.isTransientPineconeError(error)
        if (!isTransient || attempt === maxAttempts) {
          logger.warn(
            `[PineconeService] search fallback (attempt=${attempt}/${maxAttempts}): ${String(error)}`
          )
          return []
        }

        // Exponential-ish backoff: 300ms, 600ms
        await PineconeService.sleep(300 * attempt)
      }
    }

    logger.warn(`[PineconeService] search fallback: ${String(lastError)}`)
    return []
  }

  async deleteByContentAndSource(
    content: string,
    source: string
  ): Promise<{ deleted: number }> {
    try {
      if (!content) return { deleted: 0 }

      const index = await this.getIndex()
      const id = PineconeService.sha256(`${source ?? ''}:${content}`)

      const fetched = await index.fetch({ ids: [id], namespace: this.namespace })
      const hasRecord = fetched?.records?.[id] != null
      if (!hasRecord) return { deleted: 0 }

      await index.deleteOne({ id, namespace: this.namespace })
      return { deleted: 1 }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PineconeService] deleteByContentAndSource failed: ${String(error)}`)
      throw new AppError(
        'Failed to delete by content and source from Pinecone',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}

export const pineconeService = new PineconeService()
export { PineconeService }
