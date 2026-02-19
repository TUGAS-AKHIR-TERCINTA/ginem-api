import { DataTypes, Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface ISchedulerLogModelAttributes extends IBaseModelFields {
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
