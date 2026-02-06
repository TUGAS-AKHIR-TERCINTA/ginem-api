/**
 * @swagger
 * tags:
 *   name: DEVICES
 *   description: Device management (sensor, actuator, hybrid)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Device:
 *       type: object
 *       properties:
 *         deviceId:
 *           type: number
 *           example: 1
 *         deviceToken:
 *           type: string
 *           example: dev_9as8d7as9d
 *         deviceName:
 *           type: string
 *           example: Temperature Sensor Living Room
 *         deviceValue:
 *           type: string
 *           example: "26.5"
 *         deviceType:
 *           type: string
 *           enum: [sensor, actuator, hybrid]
 *           example: sensor
 *         deviceStatus:
 *           type: string
 *           enum: [online, offline]
 *           example: online
 *         deviceFirmwareVersion:
 *           type: string
 *           example: v1.0.3
 *         deviceMetadata:
 *           type: object
 *           example:
 *             unit: celsius
 *             location: living_room
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/devices:
 *   post:
 *     summary: Create new device
 *     description: Register a new device (sensor / actuator / hybrid)
 *     tags: [DEVICES]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceToken
 *               - deviceName
 *               - deviceType
 *             properties:
 *               deviceToken:
 *                 type: string
 *                 example: dev_xxx123
 *               deviceName:
 *                 type: string
 *                 example: Smart Lamp
 *               deviceValue:
 *                 type: string
 *                 example: "OFF"
 *               deviceType:
 *                 type: string
 *                 enum: [sensor, actuator, hybrid]
 *                 example: actuator
 *               deviceFirmwareVersion:
 *                 type: string
 *                 example: v2.1.0
 *               deviceMetadata:
 *                 type: object
 *                 example:
 *                   room: bedroom
 *                   voltage: 220V
 *     responses:
 *       201:
 *         description: Device created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/devices:
 *   get:
 *     summary: Get all devices
 *     description: Fetch list of registered devices
 *     tags: [DEVICES]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: size
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Devices fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Device'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/devices/{deviceId}:
 *   patch:
 *     summary: Update device
 *     description: Update device data by ID
 *     tags: [DEVICES]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceName:
 *                 type: string
 *                 example: Updated Device Name
 *               deviceValue:
 *                 type: string
 *                 example: "ON"
 *               deviceStatus:
 *                 type: string
 *                 enum: [online, offline]
 *               deviceFirmwareVersion:
 *                 type: string
 *                 example: v2.2.0
 *               deviceMetadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Device updated successfully
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/devices/{deviceId}:
 *   delete:
 *     summary: Delete device
 *     description: Soft delete device by ID
 *     tags: [DEVICES]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/devices/detail/{deviceId}:
 *   get:
 *     summary: Get device detail
 *     description: Fetch detailed information of a device by ID
 *     tags: [DEVICES]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Device detail fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
