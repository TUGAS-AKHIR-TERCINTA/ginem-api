/**
 * @swagger
 * tags:
 *   - name: APP
 *     description: NEURO AI Management
 */

/**
 * @swagger
 * /api/v1/:
 *   get:
 *     summary: App endpoint
 *     tags: [APP]
 *     description: Returns basic information about the API
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to the API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 documentation:
 *                   type: string
 *                   example: /api-docs
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [APP]
 *     description: Returns the API health status including uptime and timestamp
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-13T12:00:00.000Z
 * /api/v1/info:
 *   get:
 *     summary: App info
 *     tags: [APP]
 *     description: Returns the API info
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-13T12:00:00.000Z
 */
