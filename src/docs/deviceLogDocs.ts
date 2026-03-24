/**
 * @swagger
 * tags:
 *   name: DEVICE LOGS
 *   description: Device value management (child of Device)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceLog:
 *       type: object
 *       properties:
 *         deviceLogId:
 *           type: number
 *           example: 1
 *         deviceLogDeviceId:
 *           type: number
 *           example: 1
 *         deviceLogData:
 *           type: string
 *           example: "25.5"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     DeviceLogWithDevice:
 *       allOf:
 *         - $ref: '#/components/schemas/DeviceLog'
 *         - type: object
 *           properties:
 *             Device:
 *               $ref: '#/components/schemas/Device'
 */

/**
 * @swagger
 * /api/v1/devices/logs:
 *   post:
 *     summary: Create new device log
 *     description: Create a device log linked to a device (parent)
 *     tags: [DEVICE LOGS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceLogDeviceId
 *               - deviceLogData
 *             properties:
 *               deviceLogDeviceId:
 *                 type: number
 *                 example: 1
 *               deviceLogData:
 *                 type: string
 *                 example: "25.5"
 *     responses:
 *       201:
 *         description: Device log created successfully
 *       404:
 *         description: Device not found
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/devices/logs:
 *   get:
 *     summary: Get all device logs
 *     description: Fetch list of device logs, optionally filtered by device
 *     tags: [DEVICE LOGS]
 *     parameters:
 *       - in: query
 *         name: deviceLogDeviceId
 *         schema:
 *           type: number
 *         description: Filter by parent device ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: size
 *         schema:
 *           type: number
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Device logs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DeviceLogWithDevice'
 *                     totalItems:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     currentPage:
 *                       type: number
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/devices/logs/detail/{deviceLogId}:
 *   get:
 *     summary: Get device log detail
 *     description: Fetch detailed information of a device log by ID
 *     tags: [DEVICE LOGS]
 *     parameters:
 *       - in: path
 *         name: deviceLogId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Device log detail fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceLogWithDevice'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/devices/logs/{deviceLogId}:
 *   patch:
 *     summary: Update device log
 *     description: Update device log data by ID
 *     tags: [DEVICE LOGS]
 *     parameters:
 *       - in: path
 *         name: deviceLogId
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
 *               deviceLogDeviceId:
 *                 type: number
 *                 example: 1
 *               deviceLogData:
 *                 type: string
 *                 example: "26.0"
 *     responses:
 *       200:
 *         description: Device log updated successfully
 *       404:
 *         description: Device log or device not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/devices/logs/{deviceLogId}:
 *   delete:
 *     summary: Delete device log
 *     description: Soft delete device log by ID
 *     tags: [DEVICE LOGS]
 *     parameters:
 *       - in: path
 *         name: deviceLogId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Device log deleted successfully
 *       404:
 *         description: Device log not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceLogLastRow:
 *       type: object
 *       properties:
 *         deviceLogId:
 *           type: number
 *           example: 1
 *         deviceLogDeviceId:
 *           type: number
 *           example: 1
 *         deviceLogData:
 *           type: string
 *           example: "25.5"
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/devices/logs/last/{deviceId}:
 *   get:
 *     summary: Get last device log by device id
 *     description: Fetch the last device log row for a device (ordered by deviceLogId desc).
 *     tags: [DEVICE LOGS]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Device log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DeviceLogLastRow'
 *       404:
 *         description: Device log not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/devices/logs/latest/{deviceId}:
 *   get:
 *     summary: Get newest device log by device id
 *     description: Fetch the newest device log row for a device (ordered by createdAt desc).
 *     tags: [DEVICE LOGS]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Device log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DeviceLogLastRow'
 *       404:
 *         description: Device log not found
 *       500:
 *         description: Internal server error
 */
