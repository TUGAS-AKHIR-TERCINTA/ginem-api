import { appConfigs } from '../configs'

export interface MetaAttributes {
  version: string
  timestamp: string
  executionTime?: string
  requestId?: string
}

export interface ResponseDataAttributes {
  success: boolean
  message: string | null
  data: any
  meta: MetaAttributes
}

interface ISuccessProps {
  data?: any
  message?: string
  executionTime?: string
  requestId?: string
}

interface IErorProps {
  message?: string
  executionTime?: string
  requestId?: string
}

const buildMeta = (executionTime?: string, requestId?: string): MetaAttributes => {
  return {
    version: appConfigs.app.appVersion,
    timestamp: new Date().toISOString(),
    executionTime,
    requestId
  }
}

export const ResponseData = {
  success: ({
    data,
    message = 'Request successful',
    executionTime,
    requestId
  }: ISuccessProps): ResponseDataAttributes => ({
    success: true,
    message,
    data,
    meta: buildMeta(executionTime, requestId)
  }),

  error: ({
    message = 'Something went wrong',
    executionTime,
    requestId
  }: IErorProps): ResponseDataAttributes => ({
    success: false,
    message,
    data: null,
    meta: buildMeta(executionTime, requestId)
  })
}
