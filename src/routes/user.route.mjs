import express from 'express'
const router = express.Router();
import { login, signup, userVerification , socialLogin } from '../controllers/user.controller.mjs'
import { resendOTP } from '../controllers/resendOtp.controller.mjs';


// Define routes for users
router.post('/login' ,login);
router.post('/socialLogin', socialLogin)
router.post('/signup', signup);
router.post('/otpVerification' , userVerification )
router.post('/resendOtp', resendOTP)


export default router;

