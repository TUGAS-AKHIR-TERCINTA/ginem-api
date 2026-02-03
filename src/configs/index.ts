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
