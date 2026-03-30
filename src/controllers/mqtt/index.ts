import { sendCommand } from './sendCommand'
import { publishStatus } from './publishStatus'
import { getConnection } from './getConnection'
import { getLastStatus } from './getLastStatus'

export const MqttController = {
  sendCommand,
  publishStatus,
  getConnection,
  getLastStatus
}
