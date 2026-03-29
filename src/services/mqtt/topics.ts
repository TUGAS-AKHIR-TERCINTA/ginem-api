export const deviceCommandTopic = (deviceId: string) => `iot/${deviceId}/command`

export const deviceStatusTopic = (deviceId: string) => `iot/${deviceId}/status`

export const ALL_DEVICE_STATUS = 'iot/+/status'
