import weaviate, { type WeaviateClient } from 'weaviate-client'
import { StatusCodes } from 'http-status-codes'
import { appConfigs } from '../configs'
import { AppError } from '../utilities/AppError'
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

/**
 * Weaviate service: connect to Weaviate and index data.
 * Collection must already exist in Weaviate; this service only inserts objects.
 */
export class WeaviateService {
  private static client: WeaviateClient | null = null

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
          skipInitChecks: true
        })
      } else {
        client = await weaviate.connectToCustom({
          httpHost: config.httpHost,
          httpPort: config.httpPort,
          httpSecure: config.httpSecure,
          grpcHost: config.httpHost,
          grpcPort: config.grpcPort,
          grpcSecure: config.httpSecure,
          skipInitChecks: true
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
