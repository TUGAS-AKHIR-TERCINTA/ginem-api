import { DataTypes, type Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, type IBaseModelFields } from '../interfaces/baseModelFields'

export interface IRuleTriggerAttributes extends IBaseModelFields {
  ruleTriggerId: number
  ruleId: number
  deviceId: number
  metric: string
  eventType: 'telemetry'
}

export type IRuleTriggerCreationAttributes = Omit<
  IRuleTriggerAttributes,
  'ruleTriggerId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface RuleTriggerInstance
  extends Model<IRuleTriggerAttributes, IRuleTriggerCreationAttributes>,
    IRuleTriggerAttributes {}

export const RuleTriggerModel = sequelizeInit.define<RuleTriggerInstance>(
  'RuleTriggers',
  {
    ...BaseModelFields,
    ruleTriggerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    ruleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    deviceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    metric: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    eventType: {
      type: DataTypes.ENUM('telemetry'),
      allowNull: false,
      defaultValue: 'telemetry'
    }
  },
  {
    tableName: 'rule_triggers',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)
