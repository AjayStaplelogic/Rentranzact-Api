import express from 'express'
const router = express.Router();
import { login, signup, userVerification , socialLogin , myprofile } from '../controllers/user.controller.mjs'
import { resendOTP } from '../controllers/resendOtp.controller.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';


// Define routes for users
router.post('/login' ,login);
router.post('/socialLogin', socialLogin)
router.post('/signup', signup);
router.post('/otpVerification' , userVerification )
router.post('/resendOtp', resendOTP)
router.get("/my-profile" ,authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]) , myprofile)



export default router;

