import dotenv from 'dotenv'

dotenv.config()

export const mqttConfig = {
  brokerUrl: process.env.MQTT_BROKER_URL!,
  clientId: process.env.MQTT_CLIENT_ID ?? 'mqtt-worker',
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD
}
