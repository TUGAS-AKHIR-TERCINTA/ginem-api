export const deviceCommandTopic = (deviceId: string) => `device/${deviceId}/command`

export const deviceStatusTopic = (deviceId: string) => `device/${deviceId}/status`

export const ALL_DEVICE_STATUS = 'device/+/status'
