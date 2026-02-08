import AuthRoute from './AuthRouter'
import DeviceRoute from './DeviceRouter'
import DeviceItemRoute from './DeviceItemRouter'
import HealthRoute from './HelthRouter'
import McpRoute from './McpRouter'
import MyProfileRoute from './MyProfileRouter'
import OtpRoute from './OtpRouter'

const RoutesRegistry = {
  AuthRoute,
  HealthRoute,
  McpRoute,
  MyProfileRoute,
  OtpRoute,
  DeviceRoute,
  DeviceItemRoute
}

export default RoutesRegistry
