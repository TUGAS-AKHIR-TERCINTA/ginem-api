/* eslint-disable @typescript-eslint/no-var-requires */
const DataTypes = require('sequelize')

const BaseModelFields = {
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.fn('now')
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
}

module.exports = { BaseModelFields }
