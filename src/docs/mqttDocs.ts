/**
 * @swagger
 * tags:
 *   name: MQTT
 *   description: Publish messages to the MQTT broker (device commands and status) and read last known status
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MqttSendCommandRequest:
 *       type: object
 *       required:
 *         - deviceId
 *         - command
 *       properties:
 *         deviceId:
 *           type: number
 *           description: Device identifier used in topic iot/v1/device/{deviceId}/command
 *           example: 1
 *         command:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *           description: Command string published as JSON { "command": "0" | "1" } to the broker
 *           example: "1"
 *     MqttPublishStatusRequest:
 *       type: object
 *       required:
 *         - deviceId
 *         - status
 *       properties:
 *         deviceId:
 *           type: number
 *           description: Device identifier used in topic iot/v1/device/{deviceId}/state
 *           example: 1
 *         status:
 *           type: enum
 *           enum:
 *             - on
 *             - off
 *           description: State string published as JSON { "state" } to the broker
 *           example: "on"
 *     MqttConnectionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             connected:
 *               type: boolean
 *               description: Whether the API process is connected to the MQTT broker
 *         meta:
 *           type: object
 *     MqttLastStatusResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             deviceId:
 *               type: string
 *               example: sensor-01
 *             payload:
 *               description: Last JSON payload from device/.../status (shape depends on device)
 *               example:
 *                 status: "online"
 *             receivedAt:
 *               type: string
 *               format: date-time
 *               description: When this status was last updated (MQTT message or API publish)
 *         meta:
 *           type: object
 */

/**
 * @swagger
 * /api/v1/mqtt/connection:
 *   get:
 *     summary: MQTT broker connection state
 *     description: Returns whether this server is connected to the configured MQTT broker.
 *     tags: [MQTT]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Connection state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MqttConnectionResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/mqtt/devices/{deviceId}/status:
 *   get:
 *     summary: Get last known status for a device
 *     description: |
 *       Returns the most recent status payload cached in memory for `device/{deviceId}/status`
 *       (updated when a message is received from MQTT or when you POST publish status via API).
 *       Data is not persisted across server restarts.
 *     tags: [MQTT]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *         description: Device id (same segment as in MQTT topic)
 *         example: sensor-01
 *     responses:
 *       200:
 *         description: Last status found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MqttLastStatusResponse'
 *       404:
 *         description: No status recorded yet for this device
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/mqtt/commands:
 *   post:
 *     summary: Publish a device command to MQTT
 *     description: |
 *       Publishes to topic `iot/{deviceId}/command` with body `{"command":"<your command>"}`.
 *       Requires a valid JWT (Bearer or cookie per app configuration).
 *     tags: [MQTT]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MqttSendCommandRequest'
 *           examples:
 *             turnOn:
 *               summary: Turn device on
 *               value:
 *                 deviceId: lamp-01
 *                 command: "on"
 *     responses:
 *       200:
 *         description: Command accepted and published (or queued by the MQTT client)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deviceId:
 *                       type: string
 *                     topic:
 *                       type: string
 *                     brokerConnected:
 *                       type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/mqtt/status:
 *   post:
 *     summary: Publish device status to MQTT
 *     description: |
 *       Publishes to topic `iot/{deviceId}/status` with body `{"status":"<your status>"}`.
 *       Useful for testing or gateway-style publishing. Requires a valid JWT.
 *     tags: [MQTT]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MqttPublishStatusRequest'
 *           examples:
 *             online:
 *               summary: Report online
 *               value:
 *                 deviceId: sensor-01
 *                 status: "online"
 *     responses:
 *       200:
 *         description: Status accepted and published
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
