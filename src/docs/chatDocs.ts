/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat with the AI agent (optional natural voice reply via OpenAI TTS)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatAudio:
 *       type: object
 *       properties:
 *         mimeType:
 *           type: string
 *           example: audio/mpeg
 *         base64:
 *           type: string
 *           description: MP3 audio encoded as base64 (play via data URL on web client)
 *     ChatRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *           description: Natural language question about devices or knowledge base
 *           example: "Hidupkan lampu depan"
 *         withAudio:
 *           type: boolean
 *           default: false
 *           description: When true, includes OpenAI TTS audio of the reply in the response
 *     ChatResponseData:
 *       type: object
 *       properties:
 *         reply:
 *           type: string
 *           description: Agent text reply
 *         audio:
 *           $ref: '#/components/schemas/ChatAudio'
 *     ChatResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Chat completed successfully
 *         data:
 *           $ref: '#/components/schemas/ChatResponseData'
 *         meta:
 *           type: object
 */

/**
 * @swagger
 * /api/v1/chat:
 *   post:
 *     summary: Send message to chat agent
 *     description: |
 *       Sends a natural language message to the chat agent.
 *       Set `withAudio: true` for web voice mode — response includes `data.audio` (MP3 base64)
 *       synthesized with OpenAI TTS. STT (speech-to-text) remains on the web client.
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *           examples:
 *             textOnly:
 *               summary: Text chat
 *               value:
 *                 message: "List all devices"
 *                 withAudio: false
 *             withVoice:
 *               summary: Voice reply (web)
 *               value:
 *                 message: "Hidupkan lampu depan jam 18:00"
 *                 withAudio: true
 *     responses:
 *       200:
 *         description: Chat completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
