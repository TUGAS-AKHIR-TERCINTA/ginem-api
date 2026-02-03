/**
 * @swagger
 * tags:
 *   - name: MARKET
 *     description: Market data and AI-generated signals
 */

/**
 * @swagger
 * /api/v1/markets/top-signals:
 *   get:
 *     summary: Get top market signals (24h movers)
 *     tags: [MARKET]
 *     description: |
 *       Returns top gainers and losers based on 24-hour price change percentage
 *       from Binance USDT pairs.
 *       Data is cached for a short duration to improve performance.
 *     responses:
 *       200:
 *         description: Top market signals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gainers:
 *                   type: array
 *                   description: Top gaining symbols in the last 24 hours
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                         example: SOLUSDT
 *                       changePercent:
 *                         type: number
 *                         example: 12.34
 *                 losers:
 *                   type: array
 *                   description: Top losing symbols in the last 24 hours
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                         example: DOGEUSDT
 *                       changePercent:
 *                         type: number
 *                         example: -8.21
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the data was generated
 *                   example: 2026-02-01T01:10:00.000Z
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/markets/daily-summary:
 *   get:
 *     summary: Get daily AI market summary
 *     tags: [MARKET]
 *     description: |
 *       Returns an AI-generated daily market summary based on crypto news
 *       and sentiment analysis for the current day.
 *     responses:
 *       200:
 *         description: Daily market summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailySummaryId:
 *                   type: number
 *                   example: 12
 *                 dailySummaryDate:
 *                   type: string
 *                   format: date
 *                   example: 2026-02-01
 *                 dailySummaryMarketSentiment:
 *                   type: string
 *                   enum: [BULLISH, NEUTRAL, BEARISH]
 *                   example: BULLISH
 *                 dailySummaryConfidence:
 *                   type: number
 *                   format: float
 *                   example: 0.82
 *                 dailySummarySummary:
 *                   type: string
 *                   example: >
 *                     The crypto market shows strong bullish momentum driven by
 *                     positive macro sentiment and increased institutional inflows.
 *                 dailySummaryHighlights:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - Bitcoin breaks key resistance level
 *                     - Ethereum ETF inflow increases
 *                     - Altcoins show broad market strength
 *       404:
 *         description: Daily summary not found
 *       500:
 *         description: Internal server error
 */
