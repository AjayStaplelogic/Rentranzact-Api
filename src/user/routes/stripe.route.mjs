import express from 'express'
const router = express.Router();
import { payRent , payViaWallet } from '../controllers/stripe.controller.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import authorizer from "../middleware/authorizer.middleware.mjs";
// import { payViaWallet } from '../services/stripe.service.mjs';

router.post('/payRent', authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), payRent);
router.post('/payViaWallet' , authorizer([UserRoles.RENTER]) , payViaWallet)

export default router;

