import AppLogRoute from './AppLogRouter'
import AuthRoute from './AuthRouter'
import DeviceRoute from './DeviceRouter'
import DeviceValueRoute from './DeviceValueRouter'
import HealthRoute from './HelthRouter'
import McpRoute from './McpRouter'
import MyProfileRoute from './MyProfileRouter'
import OtpRoute from './OtpRouter'
import SchedulerLogRoute from './SchedulerLogRouter'

const RoutesRegistry = {
  AppLogRoute,
  AuthRoute,
  HealthRoute,
  McpRoute,
  MyProfileRoute,
  OtpRoute,
  DeviceRoute,
  DeviceValueRoute,
  SchedulerLogRoute
}

export default RoutesRegistry
