/**
 * @swagger
 * tags:
 *   name: WHATSAPP
 *   description: WhatsApp connectivity (Baileys) using per-user sessions and QR login
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WhatsAppConnectRequest:
 *       type: object
 *       properties:
 *         timeoutMs:
 *           type: integer
 *           minimum: 1
 *           maximum: 120000
 *           default: 30000
 *           description: How long to wait for the QR code to be generated
 *     WhatsAppConnectData:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [disconnected, connecting, connected, error]
 *         qrDataUrl:
 *           type: string
 *           nullable: true
 *           description: Data URL (base64 PNG) for the current QR code
 *     WhatsAppStatusData:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [disconnected, connecting, connected, error]
 *         qrDataUrl:
 *           type: string
 *           nullable: true
 *         lastError:
 *           type: string
 *           nullable: true
 *     WhatsAppSendRequest:
 *       type: object
 *       required: [to, message]
 *       properties:
 *         to:
 *           type: string
 *           example: 6281234567890
 *           description: "Phone number digits (or international format). Example 628... for Indonesia."
 *         message:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *           example: Hello from our backend
 *     WhatsAppSendResult:
 *       type: object
 *       properties:
 *         toJid:
 *           type: string
 *           example: 6281234567890@s.whatsapp.net
 *         success:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/v1/whatsapp/connect:
 *   post:
 *     summary: Start WhatsApp session and get QR code
 *     tags: [WHATSAPP]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WhatsAppConnectRequest'
 *     responses:
 *       200:
 *         description: QR generated or session already connected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/WhatsAppConnectData'
 */

/**
 * @swagger
 * /api/v1/whatsapp/status:
 *   get:
 *     summary: Get current WhatsApp session status
 *     tags: [WHATSAPP]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Session status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/WhatsAppStatusData'
 */

/**
 * @swagger
 * /api/v1/whatsapp/send:
 *   post:
 *     summary: Send a text message to a WhatsApp number
 *     tags: [WHATSAPP]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WhatsAppSendRequest'
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/WhatsAppSendResult'
 */

/**
 * @swagger
 * /api/v1/whatsapp/disconnect:
 *   post:
 *     summary: Disconnect WhatsApp session for the authenticated user
 *     tags: [WHATSAPP]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Disconnected
 */

/**
 * @swagger
 * /api/v1/whatsapp/qr:
 *   get:
 *     summary: Render current WhatsApp QR as PNG image
 *     tags: [WHATSAPP]
 *     produces:
 *       - image/png
 *     description: |
 *       Returns raw PNG bytes when `format=png` (default). **Authorize first** (Bearer) — opening this URL in a new tab without the token returns JSON error, not an image.
 *       For Swagger “Try it out”, use **`format=json`** and paste `data.image` into an `<img src="...">` (binary preview is unreliable in Swagger).
 *       Cross-origin frontends can embed the PNG URL in `<img>` (response sets `Cross-Origin-Resource-Policy: cross-origin`).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeoutMs
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 120000
 *           default: 30000
 *         required: false
 *         description: How long to wait until QR is available
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [png, json]
 *           default: png
 *         required: false
 *         description: |
 *           `png` = raw PNG bytes (default). `json` = same QR as data URL in JSON (recommended for Swagger “Try it out” preview).
 *     responses:
 *       200:
 *         description: QR code (PNG bytes, or JSON with data URL when format=json)
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: byte
 *               description: When format is omitted or png
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     image:
 *                       type: string
 *                       example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA...
 *               description: When format=json
 *       409:
 *         description: Session already connected (QR not required)
 *       408:
 *         description: QR not ready yet
 */

/**
 * @swagger
 * /api/v1/whatsapp/qr-base64:
 *   get:
 *     summary: Get WhatsApp QR as data URL base64 (useful for Swagger preview)
 *     tags: [WHATSAPP]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeoutMs
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 120000
 *           default: 30000
 *         required: false
 *         description: How long to wait until QR is available
 *     responses:
 *       200:
 *         description: QR rendered as base64 data URL
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
 *                   example: QR rendered as base64
 *                 data:
 *                   type: object
 *                   properties:
 *                     base64:
 *                       type: string
 *                       example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA...
 */
