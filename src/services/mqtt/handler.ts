import { MQTTService } from './MQTT.service'

export function registerMqttHandlers () {
  MQTTService.registerMessageHandlers()
}
