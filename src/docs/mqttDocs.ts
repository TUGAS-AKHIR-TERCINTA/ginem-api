/**
 * @swagger
 * tags:
 *   name: MQTT
 *   description: Publish messages to the MQTT broker (device commands and status)
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
 *           type: string
 *           minLength: 1
 *           maxLength: 128
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *           description: Device identifier used in topic iot/{deviceId}/command
 *           example: lamp-01
 *         command:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *           description: Command string published as JSON { "command" } to the broker
 *           example: "on"
 *     MqttPublishStatusRequest:
 *       type: object
 *       required:
 *         - deviceId
 *         - status
 *       properties:
 *         deviceId:
 *           type: string
 *           minLength: 1
 *           maxLength: 128
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *           description: Device identifier used in topic iot/{deviceId}/status
 *           example: sensor-01
 *         status:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *           description: Status string published as JSON { "status" } to the broker
 *           example: "online"
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
