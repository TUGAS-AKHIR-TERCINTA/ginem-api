/**
 * @swagger
 * tags:
 *   name: VECTOR INDEXES
 *   description: List vector indexes (table vector_indexes) with pagination
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VectorIndex:
 *       type: object
 *       properties:
 *         vectorIndexId:
 *           type: integer
 *           example: 1
 *         vectorIndexText:
 *           type: string
 *           description: Indexed text content
 *         vectorIndexSource:
 *           type: string
 *           enum: [pdf, text]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     VectorIndexesList:
 *       type: object
 *       properties:
 *         totalItems:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VectorIndex'
 *         totalPages:
 *           type: integer
 *         currentPage:
 *           type: integer
 */

/**
 * @swagger
 * /api/v1/vector-indexes:
 *   get:
 *     summary: Get vector indexes (paginated)
 *     description: Returns paginated list of vector indexes from table vector_indexes. Optional filter by source (pdf|text) and search in text.
 *     tags: [VECTOR INDEXES]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 1-based page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Page size
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: ['true']
 *         description: Set to "true" to apply limit/offset
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [pdf, text]
 *         description: Filter by source
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in vectorIndexText (LIKE)
 *     responses:
 *       200:
 *         description: Vector indexes retrieved successfully
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
 *                   example: Vector indexes retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/VectorIndexesList'
 *                 meta:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch vector indexes
 */
