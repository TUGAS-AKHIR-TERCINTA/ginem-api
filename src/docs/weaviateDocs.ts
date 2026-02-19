/**
 * @swagger
 * tags:
 *   name: WEAVIATE
 *   description: Weaviate vector store indexing
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IndexItem:
 *       type: object
 *       required:
 *         - text
 *         - source
 *       properties:
 *         text:
 *           type: string
 *           description: Text content to index
 *           example: "Sample document content for indexing."
 *         source:
 *           type: string
 *           enum: [pdf, text]
 *           description: Source type of the content
 *           example: pdf
 *     IndexToWeaviateRequest:
 *       type: object
 *       required:
 *         - objects
 *       properties:
 *         objects:
 *           type: array
 *           minItems: 1
 *           maxItems: 100
 *           items:
 *             $ref: '#/components/schemas/IndexItem'
 *           description: Array of items to index (text + source). Weaviate class name is set via WEAVIATE_CLASS in .env (e.g. ta-project).
 *     IndexToWeaviateResult:
 *       type: object
 *       properties:
 *         successCount:
 *           type: number
 *           example: 5
 *         failedCount:
 *           type: number
 *           example: 0
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               index:
 *                 type: number
 *               message:
 *                 type: string
 */

/**
 * @swagger
 * /api/v1/weaviate/index:
 *   post:
 *     summary: Index data to Weaviate
 *     description: Insert a batch of items (text, source) into the Weaviate class. Use WEAVIATE_MODE in .env to choose "local" (self-hosted) or "cloud" (Weaviate Cloud). Class name via WEAVIATE_CLASS (e.g. ta-project).
 *     tags: [WEAVIATE]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IndexToWeaviateRequest'
 *     responses:
 *       200:
 *         description: Indexing completed
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
 *                 data:
 *                   $ref: '#/components/schemas/IndexToWeaviateResult'
 *                 meta:
 *                   type: object
 *       400:
 *         description: Bad request (validation error)
 *       500:
 *         description: Internal server error
 */
