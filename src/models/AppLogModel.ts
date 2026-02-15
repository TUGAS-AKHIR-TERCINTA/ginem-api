import { DataTypes, Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'
import type {
  IAppLogAttributes,
  IAppLogCreationAttributes
} from '../interfaces/appLog.interface'

export interface IAppLogModelAttributes extends IBaseModelFields {
  logId: number
  level: string
  message: string
  meta?: object | null
  stack?: string | null
}

export interface AppLogInstance
  extends Model<IAppLogAttributes, IAppLogCreationAttributes>,
    IAppLogAttributes {}

export const AppLogModel = sequelizeInit.define<AppLogInstance>(
  'AppLogs',
  {
    ...BaseModelFields,
    logId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    level: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: true
    },
    stack: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: 'app_logs',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)
