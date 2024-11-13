import express from 'express'
const router = express.Router();
// import { signup, login } from '../controllers/admin.controller.mjs';
// import { resendOTP } from '../controllers/resendOtp.controller.mjs';
// import { UserRoles } from '../enums/role.enums.mjs';
// import authorizer from '../middleware/authorizer.middleware.mjs';
import { dashboard, getUserOnboardingStats } from '../controllers/dashboard.controller.mjs';


// Define routes for users
router.get('/dashboard' , dashboard);
router.get('/dashboard/user-onboarded/stats' , getUserOnboardingStats);

// router.post('/otpVerification' , userVerification )
// router.post('/resendOtp', resendOTP)
// router.get("/my-profile" ,authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]) , myprofile)

export default router;

