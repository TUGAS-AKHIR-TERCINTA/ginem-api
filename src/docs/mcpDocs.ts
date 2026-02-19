/**
 * @swagger
 * tags:
 *   name: MCP
 *   description: Model Context Protocol – AI agent for device data (natural language query)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     McpQueryRequest:
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
 *     McpQueryResponse:
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
 * /api/v1/mcp:
 *   post:
 *     summary: Send message to MCP device agent
 *     description: |
 *       Sends a natural language message to the MCP-backed device agent.
 *       The agent can list devices or get device by ID via internal tools and returns a text answer.
 *     tags: [MCP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/McpQueryRequest'
 *           examples:
 *             listDevices:
 *               summary: List devices
 *               value:
 *                 message: "List all devices"
 *             getDeviceById:
 *               summary: Get device by ID
 *               value:
 *                 message: "Get device with ID 5"
 *     responses:
 *       200:
 *         description: MCP query completed successfully
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
 *                   example: MCP query completed successfully
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
