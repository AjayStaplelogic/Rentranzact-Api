import express from 'express'
const router = express.Router();
import { payRent } from '../controllers/stripe.controller.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import authorizer from "../middleware/authorizer.middleware.mjs";

router.post('/payRent', authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), payRent);

export default router;

