/**
 * @swagger
 * tags:
 *   name: DEVICE ITEMS
 *   description: Device item management (child of Device)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceItem:
 *       type: object
 *       properties:
 *         deviceItemId:
 *           type: number
 *           example: 1
 *         deviceItemDeviceId:
 *           type: number
 *           example: 1
 *         deviceItemValue:
 *           type: string
 *           example: "25.5"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     DeviceItemWithDevice:
 *       allOf:
 *         - $ref: '#/components/schemas/DeviceItem'
 *         - type: object
 *           properties:
 *             Device:
 *               $ref: '#/components/schemas/Device'
 */

/**
 * @swagger
 * /api/v1/device-items:
 *   post:
 *     summary: Create new device item
 *     description: Create a device item linked to a device (parent)
 *     tags: [DEVICE ITEMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceItemDeviceId
 *               - deviceItemValue
 *             properties:
 *               deviceItemDeviceId:
 *                 type: number
 *                 example: 1
 *               deviceItemValue:
 *                 type: string
 *                 example: "25.5"
 *     responses:
 *       201:
 *         description: Device item created successfully
 *       404:
 *         description: Device not found
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/device-items:
 *   get:
 *     summary: Get all device items
 *     description: Fetch list of device items, optionally filtered by device
 *     tags: [DEVICE ITEMS]
 *     parameters:
 *       - in: query
 *         name: deviceItemDeviceId
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
 *         description: Device items fetched successfully
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
 *                         $ref: '#/components/schemas/DeviceItemWithDevice'
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
 * /api/v1/device-items/detail/{deviceItemId}:
 *   get:
 *     summary: Get device item detail
 *     description: Fetch detailed information of a device item by ID
 *     tags: [DEVICE ITEMS]
 *     parameters:
 *       - in: path
 *         name: deviceItemId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Device item detail fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceItemWithDevice'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/device-items/{deviceItemId}:
 *   patch:
 *     summary: Update device item
 *     description: Update device item data by ID
 *     tags: [DEVICE ITEMS]
 *     parameters:
 *       - in: path
 *         name: deviceItemId
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
 *               deviceItemDeviceId:
 *                 type: number
 *                 example: 1
 *               deviceItemValue:
 *                 type: string
 *                 example: "26.0"
 *     responses:
 *       200:
 *         description: Device item updated successfully
 *       404:
 *         description: Device item or device not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/device-items/{deviceItemId}:
 *   delete:
 *     summary: Delete device item
 *     description: Soft delete device item by ID
 *     tags: [DEVICE ITEMS]
 *     parameters:
 *       - in: path
 *         name: deviceItemId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Device item deleted successfully
 *       404:
 *         description: Device item not found
 *       500:
 *         description: Internal server error
 */
