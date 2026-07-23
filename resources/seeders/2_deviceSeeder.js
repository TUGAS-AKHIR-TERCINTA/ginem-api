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
          device_token: 'fck_seed-temp-sensor-001',
          device_name: 'Temperature Sensor Living Room',
          device_description: 'Measures ambient temperature in the living room',
          device_type: 'sensor',
          device_status: 'online',
          device_firmware_version: 'v1.0.3',
          device_metadata: JSON.stringify({
            unit: 'celsius',
            location: 'living_room'
          })
        },
        {
          device_token: 'fck_seed-smart-lamp-001',
          device_name: 'Smart Lamp Bedroom',
          device_description: 'Bedroom ceiling lamp controlled via MQTT',
          device_type: 'actuator',
          device_status: 'offline',
          device_firmware_version: 'v2.1.0',
          device_metadata: JSON.stringify({
            room: 'bedroom',
            voltage: '220V'
          })
        },
        {
          device_token: 'fck_seed-humidity-001',
          device_name: 'Humidity Sensor Greenhouse',
          device_description: 'Tracks relative humidity inside the greenhouse',
          device_type: 'sensor',
          device_status: 'online',
          device_firmware_version: 'v1.2.0',
          device_metadata: JSON.stringify({
            unit: 'percent',
            location: 'greenhouse'
          })
        },
        {
          device_token: 'fck_seed-hybrid-gate-001',
          device_name: 'Smart Gate Controller',
          device_description:
            'Hybrid gate controller with open/close state and vibration sensing',
          device_type: 'hybrid',
          device_status: 'offline',
          device_firmware_version: 'v3.0.1',
          device_metadata: JSON.stringify({
            location: 'main_entrance',
            modes: ['open', 'close', 'lock']
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
