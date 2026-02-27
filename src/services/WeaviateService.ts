import weaviate, { type WeaviateClient } from 'weaviate-client'
import { StatusCodes } from 'http-status-codes'
import { appConfigs } from '../configs'
import { AppError } from '../utilities/AppError'
import { VectorIndexesModel, VectorIndexSource } from '../models/VectorIndexesModel'
import logger from '../../logs'

type WeaviateMode = 'local' | 'cloud'

/** Single item to index: text content and source type */
export interface IndexItem {
  text: string
  source: 'pdf' | 'text'
}

/** Payload for indexing documents into Weaviate (class name from config) */
export interface IndexToWeaviatePayload {
  /** Array of objects to index; each has text and source */
  objects: IndexItem[]
}

/** Result of batch insert (success count and optional error info) */
export interface IndexToWeaviateResult {
  successCount: number
  failedCount: number
  errors?: Array<{ index: number; message: string }>
}

/** Single chunk returned from Weaviate search (for RAG context) */
export interface WeaviateSearchHit {
  text: string
  source: string
}

/** Shape of our collection: text + source (used for vectorizer config) */
type CollectionProperties = { text: string; source: string }

/**
 * Weaviate service: connect to Weaviate and index data.
 * Uses a single class (WEAVIATE_CLASS). If that collection does not exist or exists without a text vectorizer,
 * it is created or replaced with one that uses the configured vectorizer (text2vec-openai or text2vec-transformers).
 */
export class WeaviateService {
  private static client: WeaviateClient | null = null

  /**
   * Ensure the single Weaviate collection exists and uses a text vectorizer.
   * - If the collection does not exist: create it with vectorizer.
   * - If it exists but has no vectorizer or vectorizer is 'none': delete and recreate with vectorizer (one class only, with vectorize).
   * Uses WEAVIATE_VECTORIZER and properties: text, source.
   */
  static async ensureCollection(): Promise<void> {
    try {
      const client = await WeaviateService.getClient()
      const className = appConfigs.weaviate.className
      const vectorizer = appConfigs.weaviate.vectorizer

      const exists = await client.collections.exists(className)

      if (exists) {
        const config = await client.collections.export(className)
        const vectorConfigs = config?.vectorizers ? Object.values(config.vectorizers) : []

        const hasTextVectorizer = vectorConfigs.some(
          (v) => v?.vectorizer?.name && v.vectorizer.name !== 'none'
        )

        if (hasTextVectorizer) return

        logger.warn(
          `[WeaviateService] Collection "${className}" exists without a text vectorizer; replacing with a single class that uses vectorizer ${vectorizer}.`
        )

        await client.collections.delete(className)
      }

      const vectorizerConfig =
        vectorizer === 'text2vec-transformers'
          ? weaviate.configure.vectorizer.text2VecTransformers<CollectionProperties>()
          : weaviate.configure.vectorizer.text2VecOpenAI<CollectionProperties>()

      await client.collections.create({
        name: className,
        properties: [
          { name: 'text', dataType: 'text' as const },
          { name: 'source', dataType: 'text' as const }
        ],
        vectorizers: vectorizerConfig
      })

      logger.info(
        `[WeaviateService] Collection "${className}" created with vectorizer ${vectorizer} (single class only).`
      )
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[WeaviateService] ensureCollection failed: ${String(error)}`)
      throw new AppError(
        'Failed to ensure Weaviate collection',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  /**
   * Get or create a Weaviate client (connection reused).
   * Uses WEAVIATE_MODE: "local" (connectToLocal/Custom) or "cloud" (connectToWeaviateCloud).
   */
  static async getClient(): Promise<WeaviateClient> {
    if (WeaviateService.client != null) {
      return WeaviateService.client
    }

    try {
      const { weaviate: config } = appConfigs
      const openAIApiKey = appConfigs.llm?.openAIApiKey?.trim()
      const vectorizer = config.vectorizer

      // text2vec-openai needs OpenAI API key in header so Weaviate can call OpenAI for embeddings
      const headers: Record<string, string> = {}
      if (vectorizer === 'text2vec-openai') {
        if (!openAIApiKey) {
          throw AppError.badRequest(
            'OPENAI_API_KEY is required when using Weaviate vectorizer text2vec-openai. Set it in .env.'
          )
        }
        headers['X-OpenAI-Api-Key'] = openAIApiKey
      }

      const mode: WeaviateMode = config.mode === 'cloud' ? 'cloud' : 'local'

      let client: WeaviateClient

      if (mode === 'cloud') {
        const clusterUrl = config.clusterUrl?.trim()
        if (!clusterUrl) {
          throw AppError.badRequest(
            'WEAVIATE_CLUSTER_URL is required when WEAVIATE_MODE=cloud. Set it in .env.'
          )
        }
        if (!config.apiKey?.trim()) {
          throw AppError.badRequest(
            'WEAVIATE_API_KEY is required when WEAVIATE_MODE=cloud. Set it in .env.'
          )
        }
        client = await weaviate.connectToWeaviateCloud(clusterUrl, {
          authCredentials: new weaviate.ApiKey(config.apiKey),
          skipInitChecks: true,
          ...(Object.keys(headers).length > 0 && { headers })
        })
      } else {
        client = await weaviate.connectToCustom({
          httpHost: config.httpHost,
          httpPort: config.httpPort,
          httpSecure: config.httpSecure,
          grpcHost: config.httpHost,
          grpcPort: config.grpcPort,
          grpcSecure: config.httpSecure,
          skipInitChecks: true,
          ...(Object.keys(headers).length > 0 && { headers })
        })
      }

      WeaviateService.client = client
      return client
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[WeaviateService] getClient failed: ${String(error)}`)
      throw new AppError(
        'Failed to connect to Weaviate',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  /**
   * Index an array of objects into the Weaviate class (className from config).
   * Each item must have text and source (pdf | text).
   */
  static async indexData(
    payload: IndexToWeaviatePayload
  ): Promise<IndexToWeaviateResult> {
    try {
      await WeaviateService.ensureCollection()
      const client = await WeaviateService.getClient()
      const { objects } = payload
      const className = appConfigs.weaviate.className

      if (objects.length === 0) {
        return { successCount: 0, failedCount: 0 }
      }

      const collection = client.collections.use(className)
      const items = objects.map((o) => ({ text: o.text, source: o.source }))
      const result = await collection.data.insertMany(
        items as Parameters<typeof collection.data.insertMany>[0]
      )

      const errors: Array<{ index: number; message: string }> = []

      if (result.hasErrors && result.errors != null) {
        for (const [key, err] of Object.entries(result.errors)) {
          errors.push({
            index: Number(key),
            message: err?.message ?? String(err)
          })
        }
      }

      const failedCount = errors.length
      const successCount = objects.length - failedCount

      // Simpan ke MySQL (vector_indexes) untuk setiap item yang berhasil di-index ke Weaviate
      const successIndices = Object.keys(result.uuids ?? {}).map(Number)

      const toInsert = successIndices
        .filter((i) => i >= 0 && i < objects.length)
        .map((i) => ({
          vectorIndexText: objects[i].text,
          vectorIndexSource:
            objects[i].source === 'pdf' ? VectorIndexSource.PDF : VectorIndexSource.TEXT
        }))

      if (toInsert.length > 0) {
        await VectorIndexesModel.bulkCreate(toInsert)
      }

      return {
        successCount,
        failedCount,
        ...(errors.length > 0 && { errors })
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[WeaviateService] indexData failed: ${String(error)}`)
      throw new AppError(
        'Failed to index data to Weaviate',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  /**
   * Search the Weaviate collection by text (vector similarity). Used for RAG: retrieve relevant chunks for a user query.
   * @param query - Search query (e.g. user question)
   * @param limit - Max number of results (default 5)
   * @returns Array of { text, source } from matching objects; empty if none or on error (logged)
   */
  static async search(query: string, limit: number = 5): Promise<WeaviateSearchHit[]> {
    try {
      if (!query?.trim()) return []

      await WeaviateService.ensureCollection()
      const client = await WeaviateService.getClient()
      const className = appConfigs.weaviate.className
      const collection = client.collections.use(className)

      const result = await collection.query.nearText(query.trim(), {
        limit: Math.min(Math.max(1, limit), 20)
      })

      const objects = result?.objects ?? []
      const hits: WeaviateSearchHit[] = []
      for (const obj of objects) {
        const props = obj?.properties as Record<string, unknown> | undefined
        if (props && typeof props.text === 'string') {
          hits.push({
            text: props.text,
            source: typeof props.source === 'string' ? props.source : 'text'
          })
        }
      }
      return hits
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[WeaviateService] search failed: ${String(error)}`)
      return []
    }
  }

  /**
   * Close the Weaviate client connection (e.g. on app shutdown).
   */
  static async close(): Promise<void> {
    try {
      if (WeaviateService.client != null) {
        await WeaviateService.client.close()
        WeaviateService.client = null
      }
    } catch (error) {
      logger.error(`[WeaviateService] close failed: ${String(error)}`)
      throw new AppError(
        'Failed to close Weaviate connection',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
