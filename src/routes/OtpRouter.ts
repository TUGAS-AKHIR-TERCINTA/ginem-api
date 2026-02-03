import { Router } from 'express'
import { otpController } from '../controllers/otp'

const OtpRoute = Router()

OtpRoute.post('/request', otpController.requestOtp)
OtpRoute.post('/verify', otpController.verifyOtp)

export default OtpRoute
