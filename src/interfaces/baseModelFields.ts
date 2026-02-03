import { DataTypes, Sequelize } from 'sequelize'

export const BaseModelFields = {
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('now')
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
}

export interface IBaseModelFields {
  createdAt?: Date
  deletedAt?: Date | null
  updatedAt?: Date | null
  deleted?: boolean
}
