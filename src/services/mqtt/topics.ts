export const deviceCommandTopic = (deviceId: number) =>
  `iot/v1/device/${deviceId}/command`

export const deviceStateTopic = (deviceId: number) => `iot/v1/device/${deviceId}/state`

export const deviceTelemetryTopic = (deviceId: number) =>
  `iot/v1/device/${deviceId}/telemetry`

export const ALL_DEVICE_STATE = 'iot/v1/device/+/state'
export const ALL_DEVICE_TELEMETRY = 'iot/v1/device/+/telemetry'
