import { DataTypes, Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export type AppLogLevel = 'error' | 'warn' | 'info'

export interface IAppLogAttributes extends IBaseModelFields {
  appLogId: number
  appLogLevel: AppLogLevel
  appLogMessage: string
  appLogSource: string | null
  appLogMeta: string | null
}

export type IAppLogCreationAttributes = Omit<
  IAppLogAttributes,
  'appLogId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface AppLogInstance
  extends Model<IAppLogAttributes, IAppLogCreationAttributes>,
    IAppLogAttributes {}

export const AppLogModel = sequelizeInit.define<AppLogInstance>(
  'AppLogs',
  {
    ...BaseModelFields,
    appLogId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    appLogLevel: {
      type: DataTypes.ENUM('error', 'warn', 'info'),
      allowNull: false
    },
    appLogMessage: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    appLogSource: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    appLogMeta: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: 'app_logs',
    timestamps: true,
    paranoid: false,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
