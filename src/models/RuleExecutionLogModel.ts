import { DataTypes, type Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, type IBaseModelFields } from '../interfaces/baseModelFields'

export interface IRuleExecutionLogAttributes extends IBaseModelFields {
  ruleExecutionLogId: number
  ruleId: number
  eventSnapshot: object
  conditionResult?: object | null
  actionResult?: object | null
  success: boolean
  errorMessage?: string | null
  latencyMs: number
}

export type IRuleExecutionLogCreationAttributes = Omit<
  IRuleExecutionLogAttributes,
  'ruleExecutionLogId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface RuleExecutionLogInstance
  extends Model<IRuleExecutionLogAttributes, IRuleExecutionLogCreationAttributes>,
    IRuleExecutionLogAttributes {}

export const RuleExecutionLogModel = sequelizeInit.define<RuleExecutionLogInstance>(
  'RuleExecutionLogs',
  {
    ...BaseModelFields,
    ruleExecutionLogId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    ruleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    eventSnapshot: {
      type: DataTypes.JSON,
      allowNull: false
    },
    conditionResult: {
      type: DataTypes.JSON,
      allowNull: true
    },
    actionResult: {
      type: DataTypes.JSON,
      allowNull: true
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    latencyMs: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'rule_execution_logs',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)
