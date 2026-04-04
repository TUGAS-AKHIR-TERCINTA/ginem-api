import { z } from 'zod'

/** MQTT topic segment: letters, digits, underscore, hyphen (no slashes or wildcards). */

export const mqttSendCommandSchema = z.object({
  deviceId: z.number().int().positive(),
  command: z
    .string()
    .min(1)
    .max(2000)
    .regex(/^[01]$/, 'command must be 0 or 1')
})

export const mqttPublishStatusSchema = z.object({
  deviceId: z.number().int().positive(),
  status: z.string().min(1).max(2000)
})

export const mqttDeviceIdParamSchema = z.object({
  deviceId: z.number().int()
})

export type MqttSendCommandInput = z.infer<typeof mqttSendCommandSchema>
export type MqttPublishStatusInput = z.infer<typeof mqttPublishStatusSchema>
export type MqttDeviceIdParam = z.infer<typeof mqttDeviceIdParamSchema>
