/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('devices', {
      ...BaseModelFields,

      device_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },

      device_token: {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      device_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      device_type: {
        type: DataTypes.ENUM('sensor', 'actuator', 'hybrid'),
        allowNull: false
      },

      device_status: {
        type: DataTypes.ENUM('online', 'offline'),
        allowNull: false,
        defaultValue: 'offline'
      },

      device_firmware_version: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      device_metadata: {
        type: DataTypes.JSON,
        allowNull: true
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('devices')
  }
}
