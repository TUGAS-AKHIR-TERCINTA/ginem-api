import { z } from 'zod'

/** MQTT topic segment: letters, digits, underscore, hyphen (no slashes or wildcards). */
const deviceIdPattern = /^[a-zA-Z0-9_-]+$/

export const mqttSendCommandSchema = z.object({
  deviceId: z
    .string()
    .min(1)
    .max(128)
    .regex(
      deviceIdPattern,
      'deviceId must contain only letters, digits, underscore, or hyphen'
    ),
  command: z.string().min(1).max(2000)
})

export const mqttPublishStatusSchema = z.object({
  deviceId: z
    .string()
    .min(1)
    .max(128)
    .regex(
      deviceIdPattern,
      'deviceId must contain only letters, digits, underscore, or hyphen'
    ),
  status: z.string().min(1).max(2000)
})

export const mqttDeviceIdParamSchema = z.object({
  deviceId: z
    .string()
    .min(1)
    .max(128)
    .regex(
      deviceIdPattern,
      'deviceId must contain only letters, digits, underscore, or hyphen'
    )
})

export type MqttSendCommandInput = z.infer<typeof mqttSendCommandSchema>
export type MqttPublishStatusInput = z.infer<typeof mqttPublishStatusSchema>
export type MqttDeviceIdParam = z.infer<typeof mqttDeviceIdParamSchema>
