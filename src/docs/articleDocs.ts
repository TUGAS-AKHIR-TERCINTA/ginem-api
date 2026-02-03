/**
 * @swagger
 * tags:
 *   name: ARTICLES
 *   description: Article management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       properties:
 *         articleId:
 *           type: number
 *           example: 1
 *         articleTitle:
 *           type: string
 *           example: Smart Money Explained
 *         articleDescription:
 *           type: string
 *           example: Deep dive into smart money behavior in crypto market
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create new article
 *     description: Create a new article
 *     tags: [ARTICLES]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - articleTitle
 *               - articleDescription
 *             properties:
 *               articleTitle:
 *                 type: string
 *                 example: Understanding Smart Money
 *               articleDescription:
 *                 type: string
 *                 example: This article explains smart money concept in crypto.
 *     responses:
 *       201:
 *         description: Article created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     description: Fetch list of articles
 *     tags: [ARTICLES]
 *     responses:
 *       200:
 *         description: Articles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     description: Fetch single article by ID
 *     tags: [ARTICLES]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Article fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: Update article
 *     description: Update article by ID
 *     tags: [ARTICLES]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articleTitle:
 *                 type: string
 *                 example: Updated article title
 *               articleDescription:
 *                 type: string
 *                 example: Updated article description
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       404:
 *         description: Article not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Delete article
 *     description: Soft delete article by ID
 *     tags: [ARTICLES]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       404:
 *         description: Article not found
 *       500:
 *         description: Internal server error
 */
