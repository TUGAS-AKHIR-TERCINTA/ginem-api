/**
 * @swagger
 * components:
 *   schemas:
 *     IOtpVerify:
 *       type: object
 *       properties:
 *         whatsappNumber:
 *           type: string
 *           example: 6284455334434
 *         otpCode:
 *           type: string
 *           example: secret123
 *     IOtpRequest:
 *       type: object
 *       properties:
 *         whatsappNumber:
 *           type: string
 *           example: 6284455334434
 *         otpType:
 *           type: string
 *           enum: [register, reset]
 *           nullable: false
 */

/**
 * @swagger
 * /api/v1/otp/request:
 *   post:
 *     summary: OTP request
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IOtpRequest'
 *     responses:
 *       200:
 *         description: request otp successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/v1/otp/verify:
 *   post:
 *     summary: verify otp code
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IOtpVerify'
 *     responses:
 *       201:
 *         description: otp verify successfully
 *       400:
 *         description: Invalid input
 */
