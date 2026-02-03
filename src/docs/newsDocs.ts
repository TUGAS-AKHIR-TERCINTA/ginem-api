/**
 * @swagger
 * tags:
 *   name: NEWS
 *   description: News management
 */

/**
 * @swagger
 * /api/v1/news:
 *   get:
 *     summary: Get all news
 *     description: Fetch list of news
 *     tags: [NEWS]
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
 *         description: news fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *       500:
 *         description: Internal server error
 */
