import { DataTypes, type Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, type IBaseModelFields } from '../interfaces/baseModelFields'

export interface IDeviceAttributes extends IBaseModelFields {
  deviceId: number
  deviceToken: string
  deviceName: string
  deviceType: 'sensor' | 'actuator' | 'hybrid'
  deviceStatus: 'online' | 'offline'
  deviceFirmwareVersion?: string
  deviceMetadata?: object
}

export type IDeviceCreationAttributes = Omit<
IDeviceAttributes,
'deviceId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface DeviceInstance
  extends Model<IDeviceAttributes, IDeviceCreationAttributes>,
  IDeviceAttributes {}

export const DeviceModel = sequelizeInit.define<DeviceInstance>(
  'Devices',
  {
    ...BaseModelFields,
    deviceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    deviceToken: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: false
    },
    deviceName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    deviceType: {
      type: DataTypes.ENUM('sensor', 'actuator', 'hybrid'),
      allowNull: false
    },
    deviceStatus: {
      type: DataTypes.ENUM('online', 'offline'),
      defaultValue: 'offline'
    },
    deviceFirmwareVersion: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    deviceMetadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  },
  {
    tableName: 'devices',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)
