import { DataTypes, type Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, type IBaseModelFields } from '../interfaces/baseModelFields'

export interface IRuleActionAttributes extends IBaseModelFields {
  ruleActionId: number
  ruleId: number
  deviceId: number
  actionType: 'set_state'
  state: 'on' | 'off'
}

export type IRuleActionCreationAttributes = Omit<
  IRuleActionAttributes,
  'ruleActionId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface RuleActionInstance
  extends Model<IRuleActionAttributes, IRuleActionCreationAttributes>,
    IRuleActionAttributes {}

export const RuleActionModel = sequelizeInit.define<RuleActionInstance>(
  'RuleActions',
  {
    ...BaseModelFields,
    ruleActionId: {
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
    actionType: {
      type: DataTypes.ENUM('set_state'),
      allowNull: false,
      defaultValue: 'set_state'
    },
    state: {
      type: DataTypes.ENUM('on', 'off'),
      allowNull: false
    }
  },
  {
    tableName: 'rule_actions',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)
