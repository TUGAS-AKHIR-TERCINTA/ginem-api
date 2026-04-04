import { MqttMessageListener, MQTTService } from './MQTT.service'

export class TelemetryService {
  static initialize() {
    MQTTService.onDeviceTelemetry((deviceId, payload) => {
      console.log('Telemetry received:', deviceId, payload)

      // contoh:
      // simpan ke database
      // kirim ke websocket
      // trigger AI
    })
  }
}
