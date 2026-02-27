import { DataTypes, Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export enum VectorIndexSource {
  PDF = 'pdf',
  TEXT = 'text'
}

export interface IVectorIndexesModelAttributes extends IBaseModelFields {
  vectorIndexId: number
  vectorIndexText: string
  vectorIndexSource: VectorIndexSource
}

export type IVectorIndexesCreationModelAttributes = Omit<
  IVectorIndexesModelAttributes,
  'vectorIndexId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface VectorIndexesInstance
  extends Model<IVectorIndexesModelAttributes, IVectorIndexesCreationModelAttributes>,
    IVectorIndexesModelAttributes {}

export const VectorIndexesModel = sequelizeInit.define<VectorIndexesInstance>(
  'VectorIndexes',
  {
    ...BaseModelFields,
    vectorIndexId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    vectorIndexSource: {
      type: DataTypes.ENUM('pdf', 'text'),
      allowNull: false
    },
    vectorIndexText: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    tableName: 'vector_indexes',
    timestamps: true,
    paranoid: true,
    underscored: true
  }
)
