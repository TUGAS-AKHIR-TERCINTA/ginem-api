import { DataTypes, Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, IBaseModelFields } from '../interfaces/baseModelFields'

export interface IUserAttributes extends IBaseModelFields {
  userId: number
  userName: string
  userPassword: string
  userEmail: string
  userRole: 'admin' | 'user'
  userOnboardingStatus: 'waiting' | 'completed'
}

export type IUserCreationAttributes = Omit<
  IUserAttributes,
  'userId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface UserInstance
  extends Model<IUserAttributes, IUserCreationAttributes>,
    IUserAttributes {}

export const UserModel = sequelizeInit.define<UserInstance>(
  'Users',
  {
    ...BaseModelFields,
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userPassword: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    userRole: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user'
    },
    userOnboardingStatus: {
      type: DataTypes.ENUM('waiting', 'completed'),
      allowNull: true,
      defaultValue: 'waiting'
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    engine: 'InnoDB'
  }
)
