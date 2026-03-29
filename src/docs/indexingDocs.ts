/**
 * @swagger
 * tags:
 *   - name: INDEXING
 *     description: LLM-based chat with AI assistant
 */

/**
 * @swagger
 * /api/v1/indexing/index:
 *   post:
 *     summary: Index documents into Weaviate for RAG
 *     tags: [INDEXING]
 *     description: |
 *       Add text chunks to the Weaviate vector store. These documents are used as context
 *       when answering chat messages (RAG). Each item must have `content`; `source` is optional.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 items:
 *                   type: object
 *                   required:
 *                     - content
 *                   properties:
 *                     content:
 *                       type: string
 *                       description: Text chunk to index (used for vector search)
 *                       example: "Bitcoin is a decentralized digital currency created in 2009."
 *                     source:
 *                       type: string
 *                       nullable: true
 *                       description: Optional source identifier (e.g. document id or URL)
 *                       example: "crypto-basics"
 *           example:
 *             documents:
 *               - content: "Bitcoin is a decentralized digital currency created in 2009."
 *                 source: "crypto-basics"
 *               - content: "Ethereum supports smart contracts and dApps."
 *                 source: "crypto-basics"
 *     responses:
 *       200:
 *         description: Documents indexed successfully
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
 *                   type: object
 *                   properties:
 *                     indexed:
 *                       type: integer
 *                       description: Number of documents indexed
 *                 meta:
 *                   type: object
 *       400:
 *         description: Invalid request body (e.g. empty documents or invalid schema)
 *       500:
 *         description: Internal server error (e.g. Weaviate unavailable)
 */

/**
 * @swagger
 * /api/v1/indexing/index:
 *   get:
 *     summary: List all indexed documents (from main database)
 *     tags: [INDEXING]
 *     description: |
 *       Returns paginated list of indexing records from the main database (bukan dari Weaviate).
 *       Bisa filter by source, sourceType, dan search di content/source.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Halaman
 *       - in: query
 *         name: size
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *         description: Jumlah per halaman
 *       - in: query
 *         name: source
 *         schema: { type: string }
 *         description: Filter by source (partial match)
 *       - in: query
 *         name: sourceType
 *         schema: { type: string, enum: [pdf, json] }
 *         description: Filter by source type
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Cari di content atau source
 *     responses:
 *       200:
 *         description: Daftar indexing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           indexingId: { type: integer }
 *                           content: { type: string }
 *                           source: { type: string, nullable: true }
 *                           sourceType: { type: string, enum: [pdf, json], nullable: true }
 *                           createdAt: { type: string, format: date-time }
 *                     totalItems: { type: integer }
 *                     currentPage: { type: integer }
 *                     totalPages: { type: integer }
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/indexing/index/{id}:
 *   delete:
 *     summary: Delete one indexing (database + Weaviate)
 *     tags: [INDEXING]
 *     description: |
 *       Hapus satu record indexing dari database utama dan dari Weaviate.
 *       Data di Weaviate dihapus berdasarkan content dan source yang sama.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: indexingId
 *     responses:
 *       200:
 *         description: Indexing deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { type: object, properties: { id: { type: integer } } }
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Indexing not found
 *       500:
 *         description: Internal server error
 */
