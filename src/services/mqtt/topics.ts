export const deviceCommandTopic = (deviceName: string) => `device/${deviceName}/command`

export const deviceStatusTopic = (deviceName: string) => `device/${deviceName}/status`

export const ALL_DEVICE_STATUS = 'device/+/status'
