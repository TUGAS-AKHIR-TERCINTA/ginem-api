import type { IBaseModelFields } from './baseModelFields'

export type AppLogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug'

export interface IAppLogAttributes extends IBaseModelFields {
  logId: number
  level: string
  message: string
  meta?: object | null
  stack?: string | null
}

export type IAppLogCreationAttributes = Omit<
  IAppLogAttributes,
  'logId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>
