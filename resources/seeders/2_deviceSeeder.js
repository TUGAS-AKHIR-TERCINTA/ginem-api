/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.bulkInsert(
      'devices',
      [
        {
          device_token: 'fck_f202115f-2a2b-4cb0-aef2-ab5eec893220',
          device_name: 'Kipas',
          device_description: 'Kipas ruang tamu',
          device_type: 'actuator',
          device_status: 'online',
          device_firmware_version: 'v1.0.3',
          device_metadata: JSON.stringify({
            location: 'ruang tamu'
          })
        },
        {
          device_token: 'fck_e3d8bdd8-1cd9-47d2-b7ea-a8fe37efcff3',
          device_name: 'Suhu ruangan',
          device_description: 'Measures ambient temperature in the ruang tamu',
          device_type: 'sensor',
          device_status: 'online',
          device_firmware_version: 'v1.0.3',
          device_metadata: JSON.stringify({
            unit: 'celsius',
            location: 'ruang tamu'
          })
        },
        {
          device_token: 'fck_bfcda7a1-caf5-4727-a77e-a3c3367b90ee',
          device_name: 'Lampu ruang tamu',
          device_description: 'Bedroom ceiling lamp controlled via MQTT',
          device_type: 'actuator',
          device_status: 'online',
          device_firmware_version: 'v2.1.0',
          device_metadata: JSON.stringify({
            room: 'ruang tamu',
            voltage: '220V'
          })
        },
        {
          device_token: 'fck_d4a1e6c2-9b3f-4e5a-8c7d-1f2a3b4c5d6e',
          device_name: 'Lampu kamar',
          device_description: 'Bedroom lamp controlled via MQTT',
          device_type: 'actuator',
          device_status: 'online',
          device_firmware_version: 'v2.1.0',
          device_metadata: JSON.stringify({
            room: 'kamar',
            voltage: '220V'
          })
        }
      ],
      {}
    )
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.bulkDelete(
      'devices',
      {
        device_token: [
          'fck_f202115f-2a2b-4cb0-aef2-ab5eec893220',
          'fck_e3d8bdd8-1cd9-47d2-b7ea-a8fe37efcff3',
          'fck_bfcda7a1-caf5-4727-a77e-a3c3367b90ee',
          'fck_d4a1e6c2-9b3f-4e5a-8c7d-1f2a3b4c5d6e'
        ]
      },
      {}
    )
  }
}
