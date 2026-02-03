/**
 * @swagger
 * tags:
 *   name: TOKEN_SCREENER
 *   description: Token screening & validation APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AddTokenRequest:
 *       type: object
 *       required:
 *         - contractAddress
 *       properties:
 *         contractAddress:
 *           type: string
 *           description: ERC20 token contract address
 *           example: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
 *
 *     TokenMetric:
 *       type: object
 *       properties:
 *         priceUsd:
 *           type: number
 *           example: 7.12
 *         priceChange24h:
 *           type: number
 *           example: 3.45
 *         marketCapUsd:
 *           type: number
 *           example: 4300000000
 *         dexVolume24hUsd:
 *           type: number
 *           example: 210000000
 *         liquidityUsd:
 *           type: number
 *           example: 850000000
 *         dexBuy24hUsd:
 *           type: number
 *           example: 120000000
 *         dexSell24hUsd:
 *           type: number
 *           example: 90000000
 *         dexFlow24hUsd:
 *           type: number
 *           example: 30000000
 *
 *     TokenScreenerItem:
 *       type: object
 *       properties:
 *         chain:
 *           type: string
 *           example: "ethereum"
 *         name:
 *           type: string
 *           example: "Uniswap"
 *         TokenMetric:
 *           $ref: '#/components/schemas/TokenMetric'
 *
 *     TokenScreenerListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Success"
 *         data:
 *           type: object
 *           properties:
 *             rows:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TokenScreenerItem'
 *             count:
 *               type: number
 *               example: 120
 */

/**
 * @swagger
 * /api/v1/tokens/screener:
 *   get:
 *     summary: Get token screener list
 *     description: Get list of tokens with market and DEX metrics for UI table
 *     tags: [TOKEN_SCREENER]
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
 *         description: Token screener fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenScreenerListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/tokens/screener:
 *   post:
 *     summary: Add token to screener
 *     description: Index a new ERC20 token and collect market & DEX metrics
 *     tags: [TOKEN_SCREENER]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTokenRequest'
 *     responses:
 *       201:
 *         description: Token successfully added to screener
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
 *                   example: "Success"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
