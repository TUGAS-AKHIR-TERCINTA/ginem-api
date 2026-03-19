import { listDevicesTool, getDeviceByIdTool } from './device/deviceQuery.tools'
import {
  getLastLogByDeviceNameTool,
  getLast10LogsByDeviceNameTool,
  createDeviceLogByDeviceNameTool
} from './device/deviceLogs.tools'
import {
  setActuatorStateByDeviceNameTool,
  scheduleActuatorStateAfterMinutesTool,
  scheduleSensorDataAfterMinutesTool,
  getScheduledJobResultTool,
  listScheduledJobsTool
} from './device/deviceActuatorScheduler.tools'

/** All device MCP tools (for agent binding). */
export const deviceTools = [
  listDevicesTool,
  getDeviceByIdTool,
  getLastLogByDeviceNameTool,
  getLast10LogsByDeviceNameTool,
  createDeviceLogByDeviceNameTool,
  setActuatorStateByDeviceNameTool,
  scheduleActuatorStateAfterMinutesTool,
  scheduleSensorDataAfterMinutesTool,
  getScheduledJobResultTool,
  listScheduledJobsTool
]

export {
  listDevicesTool,
  getDeviceByIdTool,
  getLastLogByDeviceNameTool,
  getLast10LogsByDeviceNameTool,
  createDeviceLogByDeviceNameTool,
  setActuatorStateByDeviceNameTool,
  scheduleActuatorStateAfterMinutesTool,
  scheduleSensorDataAfterMinutesTool,
  getScheduledJobResultTool,
  listScheduledJobsTool
}
