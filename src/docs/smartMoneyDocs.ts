/**
 * @swagger
 * tags:
 *   name: SMART_MONEY
 *   description: smart money
 */

/**
 * @swagger
 * /api/v1/wallets/smart-money:
 *   get:
 *     summary: Get smart money list
 *     description: Get list of smart money
 *     tags: [SMART_MONEY]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number (starting from 0)
 *         example: 0
 *       - in: query
 *         name: size
 *         schema:
 *           type: number
 *         description: Number of records per page
 *         example: 10
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: boolean
 *         description: Enable pagination
 *         example: true
 *     responses:
 *       200:
 *         description: Smart money fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenScreenerListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
