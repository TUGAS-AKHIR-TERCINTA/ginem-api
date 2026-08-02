/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    const [devices] = await queryInterface.sequelize.query(
      `SELECT device_id, device_token FROM devices
       WHERE device_token IN (
         'fck_seed-temp-sensor-001',
         'fck_seed-smart-lamp-001',
         'fck_seed-humidity-001',
         'fck_seed-hybrid-gate-001'
       )`
    )

    const byToken = Object.fromEntries(
      devices.map((device) => [device.device_token, device.device_id])
    )

    const tempSensorId = byToken['fck_seed-temp-sensor-001']
    const smartLampId = byToken['fck_seed-smart-lamp-001']
    const humidityId = byToken['fck_seed-humidity-001']
    const hybridGateId = byToken['fck_seed-hybrid-gate-001']

    if (
      tempSensorId == null ||
      smartLampId == null ||
      humidityId == null ||
      hybridGateId == null
    ) {
      throw new Error(
        'Device log seeder requires 2_deviceSeeder to run first (seed devices missing)'
      )
    }

    await queryInterface.bulkInsert(
      'device_logs',
      [
        {
          device_log_device_id: tempSensorId,
          device_log_data: '24.5'
        },
        {
          device_log_device_id: tempSensorId,
          device_log_data: '25.1'
        },
        {
          device_log_device_id: tempSensorId,
          device_log_data: '23.8'
        },
        {
          device_log_device_id: smartLampId,
          device_log_data: '1'
        },
        {
          device_log_device_id: smartLampId,
          device_log_data: '0'
        },
        {
          device_log_device_id: humidityId,
          device_log_data: '62'
        },
        {
          device_log_device_id: humidityId,
          device_log_data: '58'
        },
        {
          device_log_device_id: hybridGateId,
          device_log_data: 'open'
        },
        {
          device_log_device_id: hybridGateId,
          device_log_data: 'close'
        }
      ],
      {}
    )
  },

  async down(queryInterface, DataTypes) {
    const [devices] = await queryInterface.sequelize.query(
      `SELECT device_id FROM devices
       WHERE device_token IN (
         'fck_seed-temp-sensor-001',
         'fck_seed-smart-lamp-001',
         'fck_seed-humidity-001',
         'fck_seed-hybrid-gate-001'
       )`
    )

    const deviceIds = devices.map((device) => device.device_id)

    if (deviceIds.length === 0) {
      return
    }

    await queryInterface.bulkDelete(
      'device_logs',
      {
        device_log_device_id: deviceIds
      },
      {}
    )
  }
}
