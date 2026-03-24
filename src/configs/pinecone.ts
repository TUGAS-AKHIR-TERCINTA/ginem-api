import dotenv from 'dotenv'

dotenv.config()

/**
 * Pinecone client settings (env-driven). Never commit API keys — use PINECONE_API_KEY in .env.
 */
export const pineconeConfig = {
  apiKey: process.env.PINECONE_API_KEY ?? '',
  indexName: process.env.PINECONE_INDEX_NAME ?? 'developer-quickstart-js',
  defaultNamespace: process.env.PINECONE_DEFAULT_NAMESPACE ?? 'ns1',
  cloud: process.env.PINECONE_CLOUD ?? 'aws',
  region: process.env.PINECONE_REGION ?? 'us-east-1',
  /** Integrated inference embedding (createIndexForModel). */
  embed: {
    model: process.env.PINECONE_EMBED_MODEL ?? 'llama-text-embed-v2',
    /** Maps inference "text" input to the record field that holds chunk text. */
    fieldMap: { text: process.env.PINECONE_TEXT_FIELD ?? 'chunk_text' } as Record<
      string,
      string
    >
  },
  /** Default rerank model for searchRecords. */
  rerankModel: process.env.PINECONE_RERANK_MODEL ?? 'bge-reranker-v2-m3',
  /** Field used for reranking (must exist on records). */
  rerankTextField: process.env.PINECONE_RERANK_TEXT_FIELD ?? 'chunk_text'
} as const

export type PineconeConfig = typeof pineconeConfig
