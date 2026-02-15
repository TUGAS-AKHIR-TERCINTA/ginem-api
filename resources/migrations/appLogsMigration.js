/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('app_logs', {
      ...BaseModelFields,

      log_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },

      level: {
        type: DataTypes.STRING(20),
        allowNull: false
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },

      meta: {
        type: DataTypes.JSON,
        allowNull: true
      },

      stack: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('app_logs')
  }
}
