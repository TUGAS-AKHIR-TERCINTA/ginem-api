/**
 * @swagger
 * tags:
 *   name: DEVICE VALUES
 *   description: Device value management (child of Device)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceValue:
 *       type: object
 *       properties:
 *         deviceValueId:
 *           type: number
 *           example: 1
 *         deviceValueDeviceId:
 *           type: number
 *           example: 1
 *         deviceValueValue:
 *           type: string
 *           example: "25.5"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     DeviceValueWithDevice:
 *       allOf:
 *         - $ref: '#/components/schemas/DeviceValue'
 *         - type: object
 *           properties:
 *             Device:
 *               $ref: '#/components/schemas/Device'
 */

/**
 * @swagger
 * /api/v1/device-values:
 *   post:
 *     summary: Create new device value
 *     description: Create a device value linked to a device (parent)
 *     tags: [DEVICE VALUES]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceValueDeviceId
 *               - deviceValueValue
 *             properties:
 *               deviceValueDeviceId:
 *                 type: number
 *                 example: 1
 *               deviceValueValue:
 *                 type: string
 *                 example: "25.5"
 *     responses:
 *       201:
 *         description: Device value created successfully
 *       404:
 *         description: Device not found
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/device-values:
 *   get:
 *     summary: Get all device values
 *     description: Fetch list of device values, optionally filtered by device
 *     tags: [DEVICE VALUES]
 *     parameters:
 *       - in: query
 *         name: deviceValueDeviceId
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
 *         description: Device values fetched successfully
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
 *                         $ref: '#/components/schemas/DeviceValueWithDevice'
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
 * /api/v1/device-values/detail/{deviceValueId}:
 *   get:
 *     summary: Get device value detail
 *     description: Fetch detailed information of a device value by ID
 *     tags: [DEVICE VALUES]
 *     parameters:
 *       - in: path
 *         name: deviceValueId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Device value detail fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceValueWithDevice'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/device-values/{deviceValueId}:
 *   patch:
 *     summary: Update device value
 *     description: Update device value data by ID
 *     tags: [DEVICE VALUES]
 *     parameters:
 *       - in: path
 *         name: deviceValueId
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
 *               deviceValueDeviceId:
 *                 type: number
 *                 example: 1
 *               deviceValueValue:
 *                 type: string
 *                 example: "26.0"
 *     responses:
 *       200:
 *         description: Device value updated successfully
 *       404:
 *         description: Device value or device not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/device-values/{deviceValueId}:
 *   delete:
 *     summary: Delete device value
 *     description: Soft delete device value by ID
 *     tags: [DEVICE VALUES]
 *     parameters:
 *       - in: path
 *         name: deviceValueId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Device value deleted successfully
 *       404:
 *         description: Device value not found
 *       500:
 *         description: Internal server error
 */
