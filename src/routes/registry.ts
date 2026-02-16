import AppLogRoute from './AppLogRouter'
import AuthRoute from './AuthRouter'
import DeviceRoute from './DeviceRouter'
import DeviceValueRoute from './DeviceValueRouter'
import HealthRoute from './HelthRouter'
import McpRoute from './McpRouter'
import MyProfileRoute from './MyProfileRouter'
import OtpRoute from './OtpRouter'
import SchedulerLogRoute from './SchedulerLogRouter'
import WeaviateRoute from './WeaviateRouter'

const RoutesRegistry = {
  AppLogRoute,
  AuthRoute,
  HealthRoute,
  McpRoute,
  MyProfileRoute,
  OtpRoute,
  DeviceRoute,
  DeviceValueRoute,
  SchedulerLogRoute,
  WeaviateRoute
}

export default RoutesRegistry
