/**
 * @swagger
 * tags:
 *   name: STATS
 *   description: Aggregate counts (devices, users, vector indexes, scheduler logs, app logs)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StatsCounts:
 *       type: object
 *       properties:
 *         devices:
 *           type: integer
 *           description: Total devices (table devices)
 *         users:
 *           type: integer
 *           description: Total users (table users)
 *         vectorIndexes:
 *           type: integer
 *           description: Total vector indexes (table vector_indexes)
 *         schedulerLogs:
 *           type: integer
 *           description: Total scheduler logs (table scheduler_logs)
 *         appLogs:
 *           type: integer
 *           description: Total app logs (table app_logs)
 */

/**
 * @swagger
 * /api/v1/stats:
 *   get:
 *     summary: Get stats counts
 *     description: Returns total counts for devices, users, vector indexes, scheduler logs, and app logs. Uses tables DeviceModel, UserModel, VectorIndexesModel, SchedulerLogModel, AppLogModel. Paranoid models exclude soft-deleted rows.
 *     tags: [STATS]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stats counts retrieved successfully
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
 *                   example: Stats counts retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/StatsCounts'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch stats counts
 */
