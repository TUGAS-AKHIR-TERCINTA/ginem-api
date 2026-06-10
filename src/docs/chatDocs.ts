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
 *           description: MP3 audio encoded as base64
 *         byteLength:
 *           type: number
 *           description: Raw audio size in bytes (verify > 1000 for playable clip)
 *           example: 48000
 *         speakText:
 *           type: string
 *           description: Text actually sent to TTS after cleanup
 *     ChatRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *           example: "Hidupkan lampu depan"
 *         withAudio:
 *           type: boolean
 *           default: false
 *         audioFormat:
 *           type: string
 *           enum: [json, binary]
 *           default: json
 *           description: |
 *             `json` — reply + audio.base64 (web frontend).
 *             `binary` — raw WAV file (Swagger download). Requires withAudio=true.
 *     ChatResponseData:
 *       type: object
 *       properties:
 *         reply:
 *           type: string
 *         audio:
 *           $ref: '#/components/schemas/ChatAudio'
 *     ChatResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/ChatResponseData'
 *         meta:
 *           type: object
 */

/**
 * @swagger
 * /api/v1/chat/tts-preview:
 *   get:
 *     summary: TTS preview (playable WAV in browser)
 *     description: |
 *       Synthesizes sample text to WAV. Easiest way to verify audio in Swagger/browser:
 *       after Execute, open the response URL in a new tab or use Download file.
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: text
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 500
 *         example: "Halo, lampu depan sudah saya hidupkan."
 *     responses:
 *       200:
 *         description: WAV audio
 *         content:
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: TTS error
 */

/**
 * @swagger
 * /api/v1/chat:
 *   post:
 *     summary: Send message to chat agent
 *     description: |
 *       **Web voice (JSON):** `withAudio: true`, `audioFormat: json` → play `data.audio.base64` as MP3.
 *
 *       **Swagger test (binary WAV):** use `voiceBinarySwagger` example → Download file → open `.wav`.
 *       Check `data.audio.byteLength` in JSON mode (should be thousands of bytes, not near zero).
 *
 *       **Quick TTS test:** use GET `/api/v1/chat/tts-preview?text=...` first.
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
 *               value:
 *                 message: "List all devices"
 *                 withAudio: false
 *             withVoiceJson:
 *               value:
 *                 message: "Hidupkan lampu depan jam 18:00"
 *                 withAudio: true
 *                 audioFormat: json
 *             voiceBinarySwagger:
 *               value:
 *                 message: "Hidupkan lampu depan jam 18:00"
 *                 withAudio: true
 *                 audioFormat: binary
 *     responses:
 *       200:
 *         description: JSON reply or WAV binary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
