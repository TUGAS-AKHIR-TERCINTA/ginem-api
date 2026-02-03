/**
 * @swagger
 * components:
 *   schemas:
 *     IAdministratorLoginRequest:
 *       type: object
 *       properties:
 *         userEmail:
 *           type: string
 *           example: qwerty
 *         userPassword:
 *           type: string
 *           example: qwerty
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IUserRegisterRequest:
 *       type: object
 *       properties:
 *         userName:
 *           type: string
 *           example: John Doe
 *         userEmail:
 *           type: string
 *           example: user@mail.com
 *         userPassword:
 *           type: string
 *           example: qwerty
 *     IUserLoginRequest:
 *       type: object
 *       properties:
 *         userEmail:
 *           type: string
 *           example: user@mail.com
 *         userPassword:
 *           type: string
 *           example: qwerty
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IAdminRegisterRequest:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           required:
 *             - userName
 *             - userPassword
 *             - userEmail
 *           properties:
 *             userName:
 *               type: string
 *               example: John Doe
 *             userPassword:
 *               type: string
 *               example: password123
 *             userEmail:
 *               type: string
 *               example: admin@mail.com
 *     IAdminLoginRequest:
 *       type: object
 *       properties:
 *         userEmail:
 *           type: string
 *           example: admin@email.com
 *         userPassword:
 *           type: string
 *           example: password123
 *
 */

/**
 * @swagger
 * /api/v1/auth/login/administrators:
 *   post:
 *     summary: Login a administrator
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IAdministratorLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/v1/auth/login/users:
 *   post:
 *     summary: Login a user
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IUserLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/v1/auth/register/users:
 *   post:
 *     summary: Register a new user
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IUserRegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
