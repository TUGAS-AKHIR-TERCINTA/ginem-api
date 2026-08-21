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
          'fck_seed-temp-sensor-001',
          'fck_seed-smart-lamp-001',
          'fck_seed-humidity-001',
          'fck_seed-hybrid-gate-001'
        ]
      },
      {}
    )
  }
}
