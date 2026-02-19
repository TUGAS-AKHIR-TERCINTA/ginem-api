import { DataTypes, Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

import { DeviceModel } from './DeviceModel'

export interface IDeviceLogModelAttributes extends IBaseModelFields {
  deviceLogId: number
  deviceLogDeviceId: number
  deviceLogData: string
}

export type IDeviceLogCreationModelAttributes = Omit<
  IDeviceLogModelAttributes,
  'deviceLogId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface DeviceLogInstance
  extends Model<IDeviceLogModelAttributes, IDeviceLogCreationModelAttributes>,
    IDeviceLogModelAttributes {}

export const DeviceLogModel = sequelizeInit.define<DeviceLogInstance>(
  'DeviceLogs',
  {
    ...BaseModelFields,
    deviceLogId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    deviceLogDeviceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'devices',
        key: 'device_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    deviceLogData: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },
  {
    tableName: 'device_logs',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)

DeviceModel.hasMany(DeviceLogModel, {
  foreignKey: 'deviceLogDeviceId',
  as: 'deviceLogs'
})

DeviceLogModel.belongsTo(DeviceModel, {
  foreignKey: 'deviceLogDeviceId',
  as: 'device'
})
