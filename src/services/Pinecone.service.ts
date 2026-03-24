import { Pinecone, type IndexModel } from '@pinecone-database/pinecone'
import { StatusCodes } from 'http-status-codes'

import logger from '../utilities/logger'
import { pineconeConfig, type PineconeConfig } from '../configs/pinecone'
import { AppError } from '../utilities/AppError'

import type { IntegratedRecord, RecordMetadataValue } from '@pinecone-database/pinecone'

/**
 * Record shape for integrated-inference indexes that embed `chunk_text` (or your configured field).
 * `chunk_text` is required; any other metadata keys must use Pinecone-allowed value types only
 * (no optional `?:` at the top level — `undefined` is not a valid `RecordMetadataValue`).
 */
export type PineconeChunkRecord = IntegratedRecord<
  { chunk_text: string } & Record<string, RecordMetadataValue>
>

type PartialPineconeConfig = Partial<PineconeConfig> & { apiKey?: string }

/**
 * Pinecone integrated-inference index: create index, upsert chunks, semantic search, rerank.
 * Prefer static methods (`PineconeService.searchKnowledgeChunks`, etc.) from other modules.
 */
export class PineconeService {
  private static shared: PineconeService | null = null

  private static ensureInstance(): PineconeService {
    if (PineconeService.shared === null) {
      PineconeService.shared = new PineconeService()
    }
    return PineconeService.shared
  }

  private readonly client: Pinecone
  private readonly settings: PineconeConfig

  private constructor(overrides?: PartialPineconeConfig) {
    this.settings = { ...pineconeConfig, ...overrides }
    if (this.settings.apiKey.trim().length === 0) {
      throw AppError.badRequest(
        'PINECONE_API_KEY is missing. Set it in .env (see .env.example).'
      )
    }
    this.client = new Pinecone({ apiKey: this.settings.apiKey })
  }

  /** Underlying SDK client (escape hatch). */
  static getSdkClient(): Pinecone {
    return PineconeService.ensureInstance().client
  }

  static getIndexName(): string {
    return PineconeService.ensureInstance().settings.indexName
  }

  static getDefaultNamespace(): string {
    return PineconeService.ensureInstance().settings.defaultNamespace
  }

  /**
   * Creates an index with integrated embedding (llama-text-embed-v2 by default).
   */
  static async createInferenceIndex(options?: {
    waitUntilReady?: boolean
    suppressConflicts?: boolean
  }): Promise<void | IndexModel> {
    return PineconeService.ensureInstance().createInferenceIndexInstance(options)
  }

  /**
   * Upsert chunk records into the configured namespace.
   */
  static async upsertChunks(
    records: PineconeChunkRecord[],
    namespace?: string
  ): Promise<void> {
    return PineconeService.ensureInstance().upsertChunksInstance(records, namespace)
  }

  /**
   * Semantic search; returns the raw `searchRecords` response from the SDK.
   */
  static async semanticSearch(params: {
    queryText: string
    topK: number
    namespace?: string
  }): Promise<unknown> {
    return PineconeService.ensureInstance().semanticSearchInstance(params)
  }

  /**
   * Semantic search with reranking.
   */
  static async semanticSearchWithRerank(params: {
    queryText: string
    topK: number
    rerankTopN: number
    rankFields?: string[]
    namespace?: string
  }): Promise<unknown> {
    return PineconeService.ensureInstance().semanticSearchWithRerankInstance(params)
  }

  /**
   * RAG helper: returns text chunks from the knowledge index.
   * Empty query → []; on failure logs and returns [] so callers can proceed without KB context.
   */
  static async searchKnowledgeChunks(
    query: string,
    limit: number = 5
  ): Promise<Array<{ text: string }>> {
    return PineconeService.ensureInstance().searchKnowledgeChunksInstance(query, limit)
  }

  private getNamespacedIndex(namespace?: string) {
    const ns = namespace ?? this.settings.defaultNamespace
    return this.client.index(this.settings.indexName).namespace(ns)
  }

  private async createInferenceIndexInstance(options?: {
    waitUntilReady?: boolean
    suppressConflicts?: boolean
  }): Promise<void | IndexModel> {
    try {
      return await this.client.createIndexForModel({
        name: this.settings.indexName,
        cloud: this.settings.cloud,
        region: this.settings.region,
        embed: {
          model: this.settings.embed.model,
          fieldMap: this.settings.embed.fieldMap
        },
        waitUntilReady: options?.waitUntilReady ?? true,
        suppressConflicts: options?.suppressConflicts ?? true
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PineconeService] createInferenceIndex failed: ${String(error)}`)
      throw new AppError(
        'Failed to create Pinecone index',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  private async upsertChunksInstance(
    records: PineconeChunkRecord[],
    namespace?: string
  ): Promise<void> {
    try {
      const ns = namespace ?? this.settings.defaultNamespace
      const index = this.getNamespacedIndex(ns)
      await index.upsertRecords({
        records,
        namespace: ns
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PineconeService] upsertChunks failed: ${String(error)}`)
      throw new AppError(
        'Failed to upsert Pinecone records',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  private static extractTextChunksFromSearchResponse(
    response: unknown,
    textField: string
  ): Array<{ text: string }> {
    if (response == null || typeof response !== 'object') return []
    const hits = (response as { result?: { hits?: Array<{ fields?: object }> } }).result
      ?.hits
    if (!Array.isArray(hits)) return []
    const out: Array<{ text: string }> = []
    for (const hit of hits) {
      const fields = hit?.fields as Record<string, unknown> | undefined
      const text = fields?.[textField]
      if (typeof text === 'string' && text.length > 0) {
        out.push({ text })
      }
    }
    return out
  }

  private async searchKnowledgeChunksInstance(
    query: string,
    limit: number
  ): Promise<Array<{ text: string }>> {
    const trimmed = query?.trim()
    if (!trimmed) return []
    const topK = Math.min(Math.max(1, limit), 20)
    const textField = this.settings.embed.fieldMap.text ?? this.settings.rerankTextField
    try {
      const raw = await this.semanticSearchInstance({ queryText: trimmed, topK })
      return PineconeService.extractTextChunksFromSearchResponse(raw, textField)
    } catch (error) {
      if (error instanceof AppError) {
        logger.error(`[PineconeService] searchKnowledgeChunks: ${error.message}`)
      } else {
        logger.error(`[PineconeService] searchKnowledgeChunks failed: ${String(error)}`)
      }
      return []
    }
  }

  private async semanticSearchInstance(params: {
    queryText: string
    topK: number
    namespace?: string
  }): Promise<unknown> {
    try {
      const ns = params.namespace ?? this.settings.defaultNamespace
      const index = this.getNamespacedIndex(ns)
      return await index.searchRecords({
        query: {
          topK: params.topK,
          inputs: { text: params.queryText }
        }
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PineconeService] semanticSearch failed: ${String(error)}`)
      throw new AppError(
        'Failed to run Pinecone semantic search',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  private async semanticSearchWithRerankInstance(params: {
    queryText: string
    topK: number
    rerankTopN: number
    rankFields?: string[]
    namespace?: string
  }): Promise<unknown> {
    try {
      const ns = params.namespace ?? this.settings.defaultNamespace
      const index = this.getNamespacedIndex(ns)
      const rankFields = params.rankFields ?? [this.settings.rerankTextField]
      return await index.searchRecords({
        query: {
          topK: params.topK,
          inputs: { text: params.queryText }
        },
        rerank: {
          model: this.settings.rerankModel,
          topN: params.rerankTopN,
          rankFields
        }
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[PineconeService] semanticSearchWithRerank failed: ${String(error)}`)
      throw new AppError(
        'Failed to run Pinecone search with rerank',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
