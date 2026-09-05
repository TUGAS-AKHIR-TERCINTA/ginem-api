/**
 * @swagger
 * tags:
 *   name: RULES
 *   description: Dynamic Rule Engine (Event-Condition-Action automation)
 */

/**
 * @swagger
 * /api/v1/rules:
 *   get:
 *     tags: [RULES]
 *     summary: List automation rules
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [RULES]
 *     summary: Create automation rule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [originalPrompt, trigger, conditions, actions]
 *             properties:
 *               name: { type: string }
 *               originalPrompt: { type: string }
 *               conditionLogic: { type: string, enum: [AND, OR] }
 *               cooldownSec: { type: integer, default: 60 }
 *               isActive: { type: boolean, default: true }
 *               trigger:
 *                 type: object
 *                 required: [deviceName, metric]
 *                 properties:
 *                   deviceName: { type: string }
 *                   metric: { type: string, example: temperature }
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [metric, operator, threshold]
 *                   properties:
 *                     deviceName: { type: string }
 *                     metric: { type: string }
 *                     operator: { type: string, enum: ['>', '>=', '<', '<=', '==', '!='] }
 *                     threshold: { type: number }
 *                     unit: { type: string }
 *               actions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [deviceName, state]
 *                   properties:
 *                     deviceName: { type: string }
 *                     state: { type: string, enum: [on, off] }
 *     responses:
 *       201:
 *         description: Created
 */

/**
 * @swagger
 * /api/v1/rules/detail/{ruleId}:
 *   get:
 *     tags: [RULES]
 *     summary: Get rule detail
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/rules:
 *   patch:
 *     tags: [RULES]
 *     summary: Update automation rule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ruleId]
 *             properties:
 *               ruleId: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/rules/active:
 *   patch:
 *     tags: [RULES]
 *     summary: Enable or disable a rule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ruleId, isActive]
 *             properties:
 *               ruleId: { type: integer }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/rules/{ruleId}:
 *   delete:
 *     tags: [RULES]
 *     summary: Delete automation rule
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/rules/execution-logs:
 *   get:
 *     tags: [RULES]
 *     summary: List rule execution logs
 *     parameters:
 *       - in: query
 *         name: ruleId
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: OK
 */
