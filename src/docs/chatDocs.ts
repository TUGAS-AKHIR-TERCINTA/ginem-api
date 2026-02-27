/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat with the AI agent
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *           description: Natural language question about devices (e.g. list devices, get device by ID)
 *           example: "List all devices"
 *     ChatResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: MCP query completed successfully
 *         data:
 *           type: object
 *           properties:
 *             answer:
 *               type: string
 *               description: Agent reply based on device tools (list_devices / get_device_by_id)
 *               example: "Here are the devices in the system..."
 *         meta:
 *           type: object
 *           properties:
 *             version:
 *               type: string
 *             timestamp:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /api/v1/chat:
 *   post:
 *     summary: Send message to chat agent
 *     description: |
 *       Sends a natural language message to the chat agent.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *           examples:
 *             chat:
 *               summary: Chat
 *               value:
 *                 message: "Hello, how are you?"
 *     responses:
 *       200:
 *         description: Chat completed successfully
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
 *                   example: Chat completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                       description: Agent reply
 *                 meta:
 *                   type: object
 *       400:
 *         description: Bad request (e.g. missing or invalid message)
 *       500:
 *         description: Internal server error
 */
