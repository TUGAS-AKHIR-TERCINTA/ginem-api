import AuthRoute from './AuthRouter'
import DeviceRoute from './DeviceRouter'
import HealthRoute from './HelthRouter'
import McpRoute from './McpRouter'
import MyProfileRoute from './MyProfileRouter'
import OtpRoute from './OtpRouter'
import SchedulerLogRoute from './SchedulerLogRouter'
import WeaviateRoute from './WeaviateRouter'
import AppLogRoute from './AppLogRouter'
import DeviceLogRoute from './DeviceLogRouter'

const RoutesRegistry = {
  AppLogRoute,
  AuthRoute,
  HealthRoute,
  McpRoute,
  MyProfileRoute,
  OtpRoute,
  DeviceRoute,
  DeviceLogRoute,
  SchedulerLogRoute,
  WeaviateRoute
}

export default RoutesRegistry
