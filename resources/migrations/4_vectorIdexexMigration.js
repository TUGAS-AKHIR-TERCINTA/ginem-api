/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('vector_indexes', {
      ...BaseModelFields,

      vector_index_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },

      vector_index_source: {
        type: DataTypes.ENUM('pdf', 'text'),
        allowNull: false
      },

      vector_index_text: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vector_indexes')
  }
}
