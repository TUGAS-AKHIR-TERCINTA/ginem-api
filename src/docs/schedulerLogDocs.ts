/**
 * @swagger
 * tags:
 *   name: SCHEDULER LOGS
 *   description: Scheduler execution logs (actuator on/off, sensor data) stored in database
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SchedulerLog:
 *       type: object
 *       properties:
 *         schedulerLogId:
 *           type: number
 *           example: 1
 *         jobId:
 *           type: string
 *           example: schedule-1739012345678-1
 *         type:
 *           type: string
 *           enum: [actuator, sensor_data]
 *           example: actuator
 *         deviceName:
 *           type: string
 *           example: Smart Lamp
 *         state:
 *           type: string
 *           enum: [on, off]
 *           nullable: true
 *         delayMinutes:
 *           type: number
 *           example: 1
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         runAt:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           example: completed
 *         result:
 *           type: object
 *           nullable: true
 *           description: Result payload when status is completed
 *         error:
 *           type: string
 *           nullable: true
 *           description: Error message when status is failed
 *         executedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/scheduler-logs:
 *   get:
 *     summary: Get all scheduler logs
 *     description: Fetch scheduler execution records with optional filters (type, status, deviceName, date range).
 *     tags: [SCHEDULER LOGS]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [actuator, sensor_data]
 *         description: Filter by job type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed]
 *         description: Filter by execution status
 *       - in: query
 *         name: deviceName
 *         schema:
 *           type: string
 *         description: Filter by device name
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
 *         description: Filter by scheduledAt from (ISO)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by scheduledAt to (ISO)
 *     responses:
 *       200:
 *         description: Scheduler logs fetched successfully
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
 *                         $ref: '#/components/schemas/SchedulerLog'
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
 * /api/v1/scheduler-logs/detail/{schedulerLogId}:
 *   get:
 *     summary: Get scheduler log detail by ID
 *     description: Fetch a single scheduler log entry by schedulerLogId
 *     tags: [SCHEDULER LOGS]
 *     parameters:
 *       - in: path
 *         name: schedulerLogId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Scheduler log detail fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchedulerLog'
 *       500:
 *         description: Internal server error
 */
