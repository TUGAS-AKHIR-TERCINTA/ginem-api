import AuthRoute from './AuthRouter'
import DeviceRoute from './DeviceRouter'
import HealthRoute from './HelthRouter'
import ChatRoute from './ChatRouter'
import MyProfileRoute from './MyProfileRouter'
import OtpRoute from './OtpRouter'
import SchedulerLogRoute from './SchedulerLogRouter'
import WeaviateRoute from './WeaviateRouter'
import AppLogRoute from './AppLogRouter'
import DeviceLogRoute from './DeviceLogRouter'
import StatsRoute from './StatsRouter'
import VectorIndexesRoute from './VectorIndexesRouter'

const RoutesRegistry = {
  AppLogRoute,
  AuthRoute,
  HealthRoute,
  ChatRoute,
  MyProfileRoute,
  OtpRoute,
  DeviceRoute,
  DeviceLogRoute,
  SchedulerLogRoute,
  WeaviateRoute,
  StatsRoute,
  VectorIndexesRoute
}

export default RoutesRegistry
