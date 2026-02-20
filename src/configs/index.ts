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
  secret: {
    keyEncryption: process.env.SECRET_KEY_ENCRYPTION,
    passwordEncryption: process.env.SECRET_PASSWORD_ENCRYPTION,
    pinEncryption: process.env.SECRET_PIN_ENCRYPTION,
    jwtToken: process.env.JWT_TOKEN
  },
  etherScan: {
    baseUrl: process.env.ETHERSCAN_BASE_URL,
    token: process.env.ETHERSCAN_TOKEN
  },
  coingecko: {
    baseUrl: process.env.COINGECKO_BASE_URL
  },
  cryptopanic: {
    baseUrl: process.env.CRYPTOPANIC_BASE_URL,
    apiKey: process.env.CRYPTOPANIC_API_KEY
  },
  binance: {
    baseUrl: process.env.BINANCE_BASE_URL
  },
  llm: {
    deepSeekApiKey: process.env.DEEPSEEK_API_KEY,
    openAIApiKey: process.env.OPENAI_API_KEY
  },
  maximumUploadFile: process.env.MAXIMUM_UPLOAD_FILE ?? 1024,
  weaviate: {
    /** Connection mode: "local" (self-hosted/Docker) or "cloud" (Weaviate Cloud). Set WEAVIATE_MODE in .env */
    mode: (process.env.WEAVIATE_MODE ?? 'local').toLowerCase() as 'local' | 'cloud',
    /** Local: HTTP host (e.g. localhost) */
    httpHost: process.env.WEAVIATE_HTTP_HOST ?? 'localhost',
    /** Local: HTTP port (e.g. 8080) */
    httpPort: parseInt(process.env.WEAVIATE_HTTP_PORT ?? '8080', 10),
    /** Local: gRPC port (e.g. 50051) */
    grpcPort: parseInt(process.env.WEAVIATE_GRPC_PORT ?? '50051', 10),
    /** Local: use HTTPS/WSS */
    httpSecure: process.env.WEAVIATE_HTTP_SECURE === 'true',
    /** Cloud: cluster URL (e.g. https://xxx.weaviate.network). Required when mode=cloud */
    clusterUrl: process.env.WEAVIATE_CLUSTER_URL ?? '',
    /** Cloud: API key for Weaviate Cloud. Required when mode=cloud */
    apiKey: process.env.WEAVIATE_API_KEY ?? '',
    /** Weaviate class name (set in .env as WEAVIATE_CLASS, e.g. ta-project) */
    className: process.env.WEAVIATE_CLASS ?? 'ta-project',
    /** Text vectorizer: "text2vec-openai" or "text2vec-transformers". Used when creating collection if not exists. */
    vectorizer: (process.env.WEAVIATE_VECTORIZER ?? 'text2vec-openai').toLowerCase() as
      | 'text2vec-openai'
      | 'text2vec-transformers'
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
