/**
 * @swagger
 * tags:
 *   name: WhatsApp
 *   description: Pairing and status for WhatsApp (Baileys) per authenticated user
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WhatsappConnectBody:
 *       type: object
 *       additionalProperties: false
 *       description: Empty JSON object `{}` (body is validated but has no required fields).
 *       example: {}
 *     WhatsappConnectionStatus:
 *       type: string
 *       enum: [disconnected, connecting, connected, error]
 *     WhatsappConnectStatusData:
 *       type: object
 *       properties:
 *         connectionStatus:
 *           $ref: '#/components/schemas/WhatsappConnectionStatus'
 *         lastDisconnectReason:
 *           type: string
 *           nullable: true
 *           description: Present when the last close had an error or logout message
 *     WhatsappPairingJsonData:
 *       type: object
 *       properties:
 *         connectionStatus:
 *           $ref: '#/components/schemas/WhatsappConnectionStatus'
 *         timedOut:
 *           type: boolean
 *           description: True if pairing QR was not received within timeoutMs
 *         lastDisconnectReason:
 *           type: string
 *           nullable: true
 *         mimeType:
 *           type: string
 *           example: image/png
 *           description: Only when type=base64 and QR was returned
 *         qrImageBase64:
 *           type: string
 *           description: PNG file as base64 string (no data URL prefix)
 *         message:
 *           type: string
 *           description: Human-readable hint (e.g. already connected, timeout)
 *     ApiSuccessEnvelope:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         meta:
 *           type: object
 *           nullable: true
 */

/**
 * @swagger
 * /api/v1/whatsapp/connect:
 *   get:
 *     summary: Start or resume WhatsApp session
 *     description: |
 *       Starts the Baileys connection for the JWT user.
 *
 *       - **No query `type`**: returns JSON immediately after connect is initiated (`connectionStatus` may be `connecting`).
 *       - **`type=base64`**: waits up to `timeoutMs` (default 30s) for a pairing QR, then returns JSON with `qrImageBase64` (PNG) when available.
 *       - **`type=image`**: same wait; response **body is raw PNG** (`Content-Type: image/png`) when QR is available. If already connected or no QR, response is JSON like other cases (see implementation).
 *     tags: [WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [base64, image]
 *         required: false
 *         description: Omit for status-only JSON; `base64` = JSON with PNG base64; `image` = binary PNG body when QR exists
 *       - in: query
 *         name: timeoutMs
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 120000
 *         required: false
 *         description: Max wait for pairing QR when `type` is set (default 30000)
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: |
 *           Success. Response is **application/json** except when `type=image` and a QR PNG is returned (then **image/png**).
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/WhatsappConnectStatusData'
 *                         - $ref: '#/components/schemas/WhatsappPairingJsonData'
 *             examples:
 *               statusOnly:
 *                 summary: Without type query
 *                 value:
 *                   success: true
 *                   message: WhatsApp connect diproses
 *                   data:
 *                     connectionStatus: connecting
 *               base64Qr:
 *                 summary: type=base64 with QR
 *                 value:
 *                   success: true
 *                   message: WhatsApp pairing QR
 *                   data:
 *                     connectionStatus: connecting
 *                     timedOut: false
 *                     mimeType: image/png
 *                     qrImageBase64: iVBORw0KGgo...
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *             examples:
 *               qrPng:
 *                 summary: Raw QR PNG (type=image)
 *       400:
 *         description: Invalid body or query (e.g. unknown query keys with strict validation)
 *       401:
 *         description: Missing or invalid Bearer token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/whatsapp/disconnect:
 *   post:
 *     summary: Log out and remove WhatsApp session (requires QR on next connect)
 *     description: |
 *       When the session is **connected**, calls Baileys `logout()` (unlink companion device on WhatsApp servers).
 *       Then **deletes** the user's session folder on disk and resets in-memory auth so a **new pairing QR** is required.
 *       After a server restart, **auto-connect will not** restore this user until they connect and scan QR again.
 *     tags: [WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Session cleared; status is `disconnected` (may include `lastDisconnectReason` hint to scan QR next)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WhatsappConnectStatusData'
 *             example:
 *               success: true
 *               message: WhatsApp disconnected
 *               data:
 *                 connectionStatus: disconnected
 *                 lastDisconnectReason: Session removed. Connect again and scan the QR code on your phone.
 *       400:
 *         description: Invalid body (strict JSON)
 *       401:
 *         description: Missing or invalid Bearer token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/whatsapp/connection-status:
 *   get:
 *     summary: Get WhatsApp connection status
 *     description: Returns current `connectionStatus` and optional `lastDisconnectReason` for the authenticated user session.
 *     tags: [WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current session status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WhatsappConnectStatusData'
 *             example:
 *               success: true
 *               message: Status koneksi WhatsApp
 *               data:
 *                 connectionStatus: disconnected
 *                 lastDisconnectReason: null
 *       401:
 *         description: Missing or invalid Bearer token
 *       500:
 *         description: Internal server error
 */
