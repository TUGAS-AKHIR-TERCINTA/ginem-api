/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.bulkInsert(
      'llm_models',
      [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'OpenAI',
          is_selected: true
        },
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          provider: 'OpenAI',
          is_selected: false
        },
        {
          id: 'deepseek-chat',
          name: 'DeepSeek Chat',
          provider: 'DeepSeek',
          is_selected: false
        }
      ],
      {}
    )
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.bulkDelete(
      'llm_models',
      {
        id: ['gpt-4', 'gpt-4o', 'deepseek-chat']
      },
      {}
    )
  }
}
