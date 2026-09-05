import { DataTypes, type Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, type IBaseModelFields } from '../interfaces/baseModelFields'

export type RuleConditionLogic = 'AND' | 'OR'

export interface IRuleAttributes extends IBaseModelFields {
  ruleId: number
  name: string
  originalPrompt: string
  conditionLogic: RuleConditionLogic
  isActive: boolean
  cooldownSec: number
  lastTriggeredAt?: Date | null
  userId?: number | null
}

export type IRuleCreationAttributes = Omit<
  IRuleAttributes,
  'ruleId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface RuleInstance
  extends Model<IRuleAttributes, IRuleCreationAttributes>,
    IRuleAttributes {}

export const RuleModel = sequelizeInit.define<RuleInstance>(
  'Rules',
  {
    ...BaseModelFields,
    ruleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    originalPrompt: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    conditionLogic: {
      type: DataTypes.ENUM('AND', 'OR'),
      allowNull: false,
      defaultValue: 'AND'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    cooldownSec: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 60
    },
    lastTriggeredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  },
  {
    tableName: 'rules',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)
