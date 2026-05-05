#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ====== WIFI ======
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// ====== MQTT ======
const char* MQTT_HOST = "192.168.1.10";   // broker IP/domain
const uint16_t MQTT_PORT = 1883;
const char* MQTT_USER = "";               // kosongkan kalau tidak pakai auth
const char* MQTT_PASS = "";
const int DEVICE_ID = 1;                  // samakan dengan deviceId di backend

WiFiClient espClient;
PubSubClient mqtt(espClient);

// contoh pin relay/LED
const int RELAY_PIN = 2;

String topicCommand()   { return "iot/v1/device/" + String(DEVICE_ID) + "/command"; }
String topicState()     { return "iot/v1/device/" + String(DEVICE_ID) + "/state"; }
String topicTelemetry() { return "iot/v1/device/" + String(DEVICE_ID) + "/telemetry"; }

void publishState(const char* state) {
  StaticJsonDocument<128> doc;
  doc["state"] = state;
  char payload[128];
  serializeJson(doc, payload);
  mqtt.publish(topicState().c_str(), payload, true); // retained=true untuk state
  Serial.printf("STATE -> %s\n", payload);
}

void publishTelemetry(float value) {
  StaticJsonDocument<128> doc;
  doc["value"] = value;
  char payload[128];
  serializeJson(doc, payload);
  mqtt.publish(topicTelemetry().c_str(), payload);
  Serial.printf("TELEMETRY -> %s\n", payload);
}

void handleCommand(const char* cmd) {
  // backend bisa kirim "1"/"0" atau "on"/"off"
  if (!strcmp(cmd, "1") || !strcasecmp(cmd, "on")) {
    digitalWrite(RELAY_PIN, HIGH);
    publishState("on");
  } else if (!strcmp(cmd, "0") || !strcasecmp(cmd, "off")) {
    digitalWrite(RELAY_PIN, LOW);
    publishState("off");
  } else {
    Serial.printf("Unknown command: %s\n", cmd);
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg;
  msg.reserve(length);
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  Serial.printf("MQTT RX [%s]: %s\n", topic, msg.c_str());

  // expect payload: {"command":"1"} atau {"command":"on"}
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, msg);
  if (err) {
    Serial.println("Invalid JSON command payload");
    return;
  }

  const char* cmd = doc["command"] | "";
  if (strlen(cmd) == 0) return;

  handleCommand(cmd);
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\nWiFi OK: %s\n", WiFi.localIP().toString().c_str());
}

void connectMQTT() {
  while (!mqtt.connected()) {
    String clientId = "esp32c3-" + String(DEVICE_ID) + "-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    Serial.printf("Connecting MQTT as %s ...\n", clientId.c_str());

    bool ok;
    if (strlen(MQTT_USER) > 0) {
      ok = mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASS);
    } else {
      ok = mqtt.connect(clientId.c_str());
    }

    if (ok) {
      Serial.println("MQTT connected");
      mqtt.subscribe(topicCommand().c_str());
      publishState("online");
    } else {
      Serial.printf("MQTT failed, rc=%d. retry 2s\n", mqtt.state());
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  connectWiFi();

  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setKeepAlive(30);
  mqtt.setSocketTimeout(15);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (!mqtt.connected()) connectMQTT();
  mqtt.loop();

  static unsigned long lastTelemetry = 0;
  if (millis() - lastTelemetry > 5000) {
    lastTelemetry = millis();

    // contoh data sensor dummy
    float value = 20.0 + (float)(esp_random() % 100) / 10.0; // 20.0 - 29.9
    publishTelemetry(value);
  }
}