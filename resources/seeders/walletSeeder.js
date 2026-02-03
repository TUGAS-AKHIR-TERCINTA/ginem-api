/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.bulkInsert(
      'wallets',
      [
        {
          wallet_address: '0x2449ecef5012f0a0e153b278ef4fcc9625bc4c78',
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    )
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.bulkDelete('wallets', null, {})
  }
}
