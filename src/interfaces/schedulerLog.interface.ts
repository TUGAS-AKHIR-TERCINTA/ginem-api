import type { IBaseModelFields } from './baseModelFields'

export interface ISchedulerLogAttributes extends IBaseModelFields {
  schedulerLogId: number
  jobId: string
  type: string
  deviceName: string
  state?: string | null
  delayMinutes: number
  scheduledAt: Date
  runAt: Date
  status: string
  result?: object | null
  error?: string | null
  executedAt?: Date | null
}

export type ISchedulerLogCreationAttributes = Omit<
  ISchedulerLogAttributes,
  'schedulerLogId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>
