import { DataTypes, type Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, type IBaseModelFields } from '../interfaces/baseModelFields'

export type RuleOperator = '>' | '>=' | '<' | '<=' | '==' | '!='

export interface IRuleConditionAttributes extends IBaseModelFields {
  ruleConditionId: number
  ruleId: number
  deviceId: number
  metric: string
  operator: RuleOperator
  threshold: number
  unit?: string | null
}

export type IRuleConditionCreationAttributes = Omit<
  IRuleConditionAttributes,
  'ruleConditionId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface RuleConditionInstance
  extends Model<IRuleConditionAttributes, IRuleConditionCreationAttributes>,
    IRuleConditionAttributes {}

export const RuleConditionModel = sequelizeInit.define<RuleConditionInstance>(
  'RuleConditions',
  {
    ...BaseModelFields,
    ruleConditionId: {
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
    operator: {
      type: DataTypes.ENUM('>', '>=', '<', '<=', '==', '!='),
      allowNull: false
    },
    threshold: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(32),
      allowNull: true
    }
  },
  {
    tableName: 'rule_conditions',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)
