/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('app_logs', {
      ...BaseModelFields,
      app_log_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      app_log_level: {
        type: DataTypes.ENUM('error', 'warn', 'info'),
        allowNull: false
      },
      app_log_message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      app_log_source: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      app_log_meta: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('app_logs')
  }
}
