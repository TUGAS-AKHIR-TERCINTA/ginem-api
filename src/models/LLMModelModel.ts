import { DataTypes, type Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, type IBaseModelFields } from '../interfaces/baseModelFields'

export interface ILLMModelAttributes extends IBaseModelFields {
  id: string
  name: string
  provider: string
  isSelected: boolean
}

export type ILLMModelCreationAttributes = Omit<
  ILLMModelAttributes,
  'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface LLMModelInstance
  extends Model<ILLMModelAttributes, ILLMModelCreationAttributes>,
    ILLMModelAttributes {}

export const LLMModelModel = sequelizeInit.define<LLMModelInstance>(
  'LLMModels',
  {
    ...BaseModelFields,
    id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    provider: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    isSelected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'llm_models',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)
