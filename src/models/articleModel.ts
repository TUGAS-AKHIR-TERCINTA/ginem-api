import { DataTypes, Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface IArticleAttributes extends IBaseModelFields {
  articleId: number
  articleTitle: string
  articleDescription: string
}

export type IArticleCreationAttributes = Omit<
  IArticleAttributes,
  'articleId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface ArticleInstance
  extends Model<IArticleAttributes, IArticleCreationAttributes>,
    IArticleAttributes {}

export const ArticleModel = sequelizeInit.define<ArticleInstance>(
  'Articles',
  {
    ...BaseModelFields,
    articleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    articleTitle: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    articleDescription: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    tableName: 'articles',
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true
  }
)
