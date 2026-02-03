/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.bulkInsert(
      'users',
      [
        {
          user_name: 'user1',
          user_password: '6c18398bb71db30c63a90b5b3ff1aba06e3477f2',
          user_email: 'user1@mail.com',
          user_role: 'user',
          user_onboarding_status: 'completed'
        },
        {
          user_name: 'admin1',
          user_password: '6c18398bb71db30c63a90b5b3ff1aba06e3477f2',
          user_email: 'admin1@mail.com',
          user_role: 'admin',
          user_onboarding_status: 'completed'
        }
      ],
      {}
    )
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.bulkDelete('users', null, {})
  }
}
