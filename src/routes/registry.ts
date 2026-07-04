import AuthRoute from './AuthRouter'
import DeviceRoute from './DeviceRouter'
import HealthRoute from './HelthRouter'
import ChatRoute from './ChatRouter'
import MyProfileRoute from './MyProfileRouter'
import SchedulerLogRoute from './SchedulerLogRouter'
import AppLogRoute from './AppLogRouter'
import DeviceLogRoute from './DeviceLogRouter'
import StatsRoute from './StatsRouter'
import WhatsAppRoute from './WhatsAppRouter'
import IndexingRoute from './IndexingRouter'
import MqttRoute from './MqttRouter'
import AdminRoute from './AdminRouter'
import SettingRoute from './SettingRouter'

const RoutesRegistry = {
  AppLogRoute,
  AuthRoute,
  HealthRoute,
  ChatRoute,
  MyProfileRoute,
  DeviceRoute,
  DeviceLogRoute,
  SchedulerLogRoute,
  StatsRoute,
  WhatsAppRoute,
  IndexingRoute,
  MqttRoute,
  AdminRoute,
  SettingRoute
}

export default RoutesRegistry
