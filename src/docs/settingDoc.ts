/**
 * @swagger
 * tags:
 *   - name: SETTINGS
 *     description: AI model configuration and selection
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LLMModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: gpt-4
 *         name:
 *           type: string
 *           example: GPT-4
 *         provider:
 *           type: string
 *           example: OpenAI
 *
 *     LLMModelListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             totalItems:
 *               type: number
 *               example: 3
 *             items:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LLMModel'
 */

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Get all available AI models
 *     description: Returns list of available LLM models from configuration
 *     tags: [SETTINGS]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter models by name or provider
 *     responses:
 *       200:
 *         description: Models fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LLMModelListResponse'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/settings/{id}:
 *   get:
 *     summary: Get model detail
 *     description: Get detail of a specific LLM model
 *     tags: [SETTINGS]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: gpt-4
 *     responses:
 *       200:
 *         description: Model detail fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LLMModel'
 *       404:
 *         description: Model not found
 */

/**
 * @swagger
 * /api/v1/settings/selected:
 *   get:
 *     summary: Get selected AI model
 *     description: Returns currently selected model used by the system
 *     tags: [SETTINGS]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Selected model fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LLMModel'
 *       404:
 *         description: Selected model not found
 */

/**
 * @swagger
 * /api/v1/settings/select:
 *   post:
 *     summary: Select active AI model
 *     description: Set one model as active model for the system
 *     tags: [SETTINGS]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelId
 *             properties:
 *               modelId:
 *                 type: string
 *                 example: gpt-4
 *     responses:
 *       200:
 *         description: Model selected successfully
 *       404:
 *         description: Model not found
 *       500:
 *         description: Internal server error
 */
