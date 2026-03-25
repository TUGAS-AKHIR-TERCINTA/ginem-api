/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('indexings', {
      ...BaseModelFields,
      indexing_id: {
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
      source_type: {
        type: DataTypes.ENUM('pdf', 'json'),
        allowNull: true
      }
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('indexings')
  }
}
