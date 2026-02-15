/**
 * @swagger
 * tags:
 *   name: APP LOGS
 *   description: Application logs (error, info, warn, etc.) stored in database
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AppLog:
 *       type: object
 *       properties:
 *         logId:
 *           type: number
 *           example: 1
 *         level:
 *           type: string
 *           enum: [error, warn, info, http, verbose, debug]
 *           example: info
 *         message:
 *           type: string
 *           example: Server running on http://localhost:8000
 *         meta:
 *           type: object
 *           nullable: true
 *         stack:
 *           type: string
 *           nullable: true
 *           description: Error stack trace when level is error
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/logs:
 *   get:
 *     summary: Get all application logs
 *     description: Fetch logs from database with optional filter by level and date range. All logs (error, info, warn, etc.) are stored when registerDatabaseTransport is used at startup.
 *     tags: [APP LOGS]
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, http, verbose, debug]
 *         description: Filter by log level
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: size
 *         schema:
 *           type: number
 *         description: Page size (default 20)
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date (ISO)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date (ISO)
 *     responses:
 *       200:
 *         description: Logs fetched successfully
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
 *                         $ref: '#/components/schemas/AppLog'
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
 * /api/v1/logs/detail/{logId}:
 *   get:
 *     summary: Get log detail by ID
 *     description: Fetch a single log entry by logId
 *     tags: [APP LOGS]
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Log detail fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppLog'
 *       500:
 *         description: Internal server error
 */
