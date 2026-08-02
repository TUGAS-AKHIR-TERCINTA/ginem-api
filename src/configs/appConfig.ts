import dotenv from 'dotenv'
dotenv.config()

export const appConfigs = {
  app: {
    appVersion: process.env.APP_VERSION ?? '',
    appMode: process.env.APP_MODE ?? 'development',
    env: process.env.APP_ENV,
    port: process.env.APP_PORT ?? 8000,
    log: process.env.APP_LOG === 'true'
  },
  cors: {
    origin: process.env.CORS_ORIGIN
  },
  rateLimit: {
    windowMinutes: process.env.RATE_LIMIT_WINDOW_MINUTES,
    maxRequest: process.env.RATE_LIMIT_MAX_REQUESTS
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@127.0.0.1:5672',
    chatQueue: process.env.RABBITMQ_CHAT_QUEUE ?? 'chat.llm.requests',
    /** Max wait for LLM reply over the broker (web RPC). */
    chatReplyTimeoutMs: Number(process.env.RABBITMQ_CHAT_REPLY_TIMEOUT_MS ?? 120000)
  },
  secret: {
    keyEncryption: process.env.SECRET_KEY_ENCRYPTION,
    passwordEncryption: process.env.SECRET_PASSWORD_ENCRYPTION,
    pinEncryption: process.env.SECRET_PIN_ENCRYPTION,
    jwtToken: process.env.JWT_TOKEN
  },
  llm: {
    deepSeekApiKey: process.env.DEEPSEEK_API_KEY,
    openAIApiKey: process.env.OPENAI_API_KEY
  },
  tts: {
    model: process.env.OPENAI_TTS_MODEL ?? 'tts-1-hd',
    voice: process.env.OPENAI_TTS_VOICE ?? 'nova'
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME,
    namespace: process.env.PINECONE_NAMESPACE,
    embeddingModel: process.env.PINECONE_EMBEDDING_MODEL
  },
  dataBase: {
    development: {
      username: process.env.DB_USER_NAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      timezone: '+07:00',
      dialectOptions: {
        dateStrings: true,
        typeCast: true
      },
      dialect: process.env.DB_DIALECT,
      logging: process.env.DB_LOG === 'true',
      port: parseInt(process.env.DB_PORT ?? '3306')
    },
    testing: {
      username: process.env.DB_USER_NAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      logging: process.env.DB_LOG === 'true'
    },
    production: {
      username: process.env.DB_USER_NAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      logging: process.env.DB_LOG === 'true'
    }
  }
}
