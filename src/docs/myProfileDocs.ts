/**
 * @swagger
 * components:
 *   schemas:
 *     IMyProfileUpdateRequest:
 *       type: object
 *       properties:
 *         userName:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           nullable: true
 *           example: "John Doe"
 *         userPassword:
 *           type: string
 *           minLength: 6
 *           maxLength: 128
 *           nullable: true
 *           example: "newSecret123"
 *         userEmail:
 *           type: string
 *           nullable: true
 *           example: "user@mail.com"
 *     IOnboardingUpdateRequest:
 *       type: object
 *       properties:
 *         userOnboardingStatus:
 *           type: string
 *           enum: [waiting, completed]
 *           default: waiting
 */

/**
 * @swagger
 * /api/v1/my-profiles:
 *   get:
 *     summary: Get user profile detail by ID
 *     tags: [MY PROFILE]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile detail
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/my-profiles:
 *   patch:
 *     summary: Update user profile
 *     tags: [MY PROFILE]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IMyProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/my-profiles/onboardings:
 *   patch:
 *     summary: Update onboarding
 *     tags: [MY PROFILE]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IOnboardingUpdateRequest'
 *     responses:
 *       200:
 *         description: onboarding updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */
