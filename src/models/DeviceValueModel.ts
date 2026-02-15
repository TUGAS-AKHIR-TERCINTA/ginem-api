import { DataTypes, Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'
import type {
  IDeviceValueAttributes,
  IDeviceValueCreationAttributes
} from '../interfaces/deviceValue.interface'
import { DeviceModel } from './DeviceModel'

export interface IDeviceValueModelAttributes extends IBaseModelFields {
  deviceValueId: number
  deviceValueDeviceId: number
  deviceValueValue: string
}

export type IDeviceValueCreationModelAttributes = Omit<
  IDeviceValueModelAttributes,
  'deviceValueId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface DeviceValueInstance
  extends Model<IDeviceValueAttributes, IDeviceValueCreationAttributes>,
    IDeviceValueAttributes {}

export const DeviceValueModel = sequelizeInit.define<DeviceValueInstance>(
  'DeviceValues',
  {
    ...BaseModelFields,
    deviceValueId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    deviceValueDeviceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'devices',
        key: 'device_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    deviceValueValue: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },
  {
    tableName: 'device_values',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)

DeviceModel.hasMany(DeviceValueModel, {
  foreignKey: 'deviceValueDeviceId',
  as: 'deviceValues'
})
DeviceValueModel.belongsTo(DeviceModel, { foreignKey: 'deviceValueDeviceId', as: 'device' })

export type { IDeviceValueCreationAttributes }
