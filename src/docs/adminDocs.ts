/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: Admin user management (requires admin role)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminUser:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           example: 1
 *         userName:
 *           type: string
 *           example: Super Admin
 *         userEmail:
 *           type: string
 *           format: email
 *         userRole:
 *           type: string
 *           enum: [admin]
 *         userOnboardingStatus:
 *           type: string
 *           enum: [waiting, completed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateAdminRequest:
 *       type: object
 *       required:
 *         - userName
 *         - userEmail
 *         - userPassword
 *       properties:
 *         userName:
 *           type: string
 *         userEmail:
 *           type: string
 *           format: email
 *         userPassword:
 *           type: string
 *           minLength: 6
 *         userOnboardingStatus:
 *           type: string
 *           enum: [waiting, completed]
 *     UpdateAdminRequest:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: integer
 *         userName:
 *           type: string
 *         userEmail:
 *           type: string
 *           format: email
 *         userPassword:
 *           type: string
 *           minLength: 6
 *         userOnboardingStatus:
 *           type: string
 *           enum: [waiting, completed]
 */

/**
 * @swagger
 * /api/v1/admins:
 *   get:
 *     summary: List admin users
 *     description: Paginated list of users with role admin. Optional search on name or email.
 *     tags: [Admins]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter by userName or userEmail (partial match)
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *     responses:
 *       200:
 *         description: Paginated admins
 *       401:
 *         description: Unauthorized or not admin
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create admin user
 *     description: Creates a new user with role admin (password is hashed).
 *     tags: [Admins]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminRequest'
 *     responses:
 *       201:
 *         description: Admin created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 *       401:
 *         description: Unauthorized or not admin
 *   patch:
 *     summary: Update admin user
 *     description: Partial update by userId. Omit password to keep current hash.
 *     tags: [Admins]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdminRequest'
 *     responses:
 *       200:
 *         description: Admin updated
 *       404:
 *         description: Admin not found
 *       409:
 *         description: Email conflict
 *       401:
 *         description: Unauthorized or not admin
 */

/**
 * @swagger
 * /api/v1/admins/detail/{userId}:
 *   get:
 *     summary: Get admin by userId
 *     tags: [Admins]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin user (password never returned)
 *       404:
 *         description: Not found or not an admin
 *       401:
 *         description: Unauthorized or not admin
 */

/**
 * @swagger
 * /api/v1/admins/{userId}:
 *   delete:
 *     summary: Delete admin (soft delete)
 *     description: Cannot delete yourself or the last admin account.
 *     tags: [Admins]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: Admin not found
 *       409:
 *         description: Last admin cannot be deleted
 *       401:
 *         description: Unauthorized or not admin
 */
