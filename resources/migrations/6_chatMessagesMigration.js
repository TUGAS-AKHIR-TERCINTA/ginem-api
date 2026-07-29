/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('chat_messages', {
      ...BaseModelFields,

      chat_message_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },

      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      session_id: {
        type: DataTypes.STRING(191),
        allowNull: false
      },

      role: {
        type: DataTypes.ENUM('user', 'assistant'),
        allowNull: false
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },

      source: {
        type: DataTypes.ENUM('web', 'whatsapp'),
        allowNull: false,
        defaultValue: 'web'
      }
    })

    await queryInterface.addIndex(
      'chat_messages',
      ['user_id', 'session_id', 'created_at'],
      {
        name: 'chat_messages_user_session_created_idx'
      }
    )
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chat_messages')
  }
}
