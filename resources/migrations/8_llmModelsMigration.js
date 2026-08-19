/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('llm_models', {
      ...BaseModelFields,
      id: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      provider: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      is_selected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    })

    await queryInterface.addIndex('llm_models', ['is_selected', 'deleted'], {
      name: 'llm_models_selected_deleted_idx'
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('llm_models')
  }
}
