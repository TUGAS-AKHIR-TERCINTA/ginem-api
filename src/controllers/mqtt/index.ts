import { sendCommand } from './sendCommand'
import { publishStatus } from './publishStatus'
import { getConnection } from './getConnection'

export const MqttController = {
  sendCommand,
  publishStatus,
  getConnection
}
