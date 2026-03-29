import cors from 'cors'
import { appConfigs } from '../configs/appConfig'

export const corsOrigin = () =>
  cors({
    origin: appConfigs.cors.origin?.toString().split(',') ?? ['http://localhost:5173'],
    credentials: true
  })
