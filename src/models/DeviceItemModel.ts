import { DataTypes, Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'
import type { IDeviceItemAttributes, IDeviceItemCreationAttributes } from '../interfaces/deviceItem.interface'
import { DeviceModel } from './DeviceModel'

export interface IDeviceItemModelAttributes extends IBaseModelFields {
  deviceItemId: number
  deviceItemDeviceId: number
  deviceItemValue: string
}

export type IDeviceItemCreationModelAttributes = Omit<
  IDeviceItemModelAttributes,
  'deviceItemId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface DeviceItemInstance
  extends Model<IDeviceItemAttributes, IDeviceItemCreationAttributes>,
    IDeviceItemAttributes {}

export const DeviceItemModel = sequelizeInit.define<DeviceItemInstance>(
  'DeviceItems',
  {
    ...BaseModelFields,
    deviceItemId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    deviceItemDeviceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'devices',
        key: 'device_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    deviceItemValue: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },
  {
    tableName: 'device_items',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)

DeviceModel.hasMany(DeviceItemModel, { foreignKey: 'deviceItemDeviceId', as: 'DeviceItems' })
DeviceItemModel.belongsTo(DeviceModel, { foreignKey: 'deviceItemDeviceId', as: 'Device' })

export type { IDeviceItemCreationAttributes }
