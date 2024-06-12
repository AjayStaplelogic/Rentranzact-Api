import express from 'express'
const router = express.Router();
import { login, signup, userVerification , socialLogin } from '../controllers/user.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import { resendOTP } from '../controllers/resendOtp.controller.mjs';

// Define routes for users
router.post('/login' ,login);
router.post('/social-login', socialLogin)
router.post('/signup', signup);
router.post('/otpVerification' , userVerification )
router.post('/resendOtp', resendOTP)
// router.get('/users/:id', UserController.getUserById);
// router.post('/users', UserController.createUser);
// router.put('/users/:id', UserController.updateUser);
// router.delete('/users/:id', UserController.deleteUser);



export default router;

