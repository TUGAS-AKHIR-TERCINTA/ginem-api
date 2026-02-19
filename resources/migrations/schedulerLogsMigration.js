/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('scheduler_logs', {
      ...BaseModelFields,

      scheduler_log_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },

      job_id: {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      type: {
        type: DataTypes.STRING(30),
        allowNull: false
      },

      device_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      state: {
        type: DataTypes.STRING(10),
        allowNull: true
      },

      delay_minutes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: false
      },

      run_at: {
        type: DataTypes.DATE,
        allowNull: false
      },

      status: {
        type: DataTypes.STRING(20),
        allowNull: false
      },

      result: {
        type: DataTypes.JSON,
        allowNull: true
      },

      error: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      executed_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('scheduler_logs')
  }
}
