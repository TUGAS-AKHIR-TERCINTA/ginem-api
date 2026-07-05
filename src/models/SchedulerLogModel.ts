import { DataTypes, type Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, type IBaseModelFields } from '../interfaces/baseModelFields'

export type SchedulerCategory = 'once' | 'repeat'
export type SchedulerLogStatus = 'pending' | 'active' | 'completed' | 'failed'

export interface ISchedulerLogModelAttributes extends IBaseModelFields {
  schedulerLogId: number
  jobId: string
  type: string
  category: SchedulerCategory
  deviceName: string
  state?: string | null
  delayMinutes: number
  scheduledAt: Date
  runAt: Date
  cronPattern?: string | null
  timezone: string
  status: SchedulerLogStatus
  result?: object | null
  error?: string | null
  executedAt?: Date | null
}

export type ISchedulerLogCreationModelAttributes = Omit<
ISchedulerLogModelAttributes,
'schedulerLogId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface SchedulerLogInstance
  extends Model<ISchedulerLogModelAttributes, ISchedulerLogCreationModelAttributes>,
  ISchedulerLogModelAttributes {}

export const SchedulerLogModel = sequelizeInit.define<SchedulerLogInstance>(
  'SchedulerLogs',
  {
    ...BaseModelFields,
    schedulerLogId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    jobId: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'once'
    },
    deviceName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    delayMinutes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    runAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cronPattern: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Asia/Jakarta'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    result: {
      type: DataTypes.JSON,
      allowNull: true
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    executedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'scheduler_logs',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)
