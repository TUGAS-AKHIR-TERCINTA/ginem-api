/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('device_logs', {
      ...BaseModelFields,

      device_log_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },

      device_log_device_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'device_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      device_log_data: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_logs')
  }
}
