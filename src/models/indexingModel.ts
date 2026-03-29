import { DataTypes, Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export type IndexingSourceType = 'pdf' | 'json'

export interface IIndexingAttributes extends IBaseModelFields {
  indexingId: number
  content: string
  source: string | null
  sourceType: IndexingSourceType | null
}

export type IIndexingCreationAttributes = Omit<
  IIndexingAttributes,
  'indexingId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface IndexingInstance
  extends Model<IIndexingAttributes, IIndexingCreationAttributes>,
    IIndexingAttributes {}

export const IndexingModel = sequelizeInit.define<IndexingInstance>(
  'Indexings',
  {
    ...BaseModelFields,
    indexingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    source: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    sourceType: {
      type: DataTypes.ENUM('pdf', 'json'),
      allowNull: true
    }
  },
  {
    tableName: 'indexings',
    timestamps: true,
    paranoid: false,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
