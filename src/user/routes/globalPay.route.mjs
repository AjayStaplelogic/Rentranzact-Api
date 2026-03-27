import express from 'express';
const router = express.Router();
import { UserRoles } from "../enums/role.enums.mjs";
import authorizer from '../middleware/authorizer.middleware.mjs';
import { payViaGlobalPay } from '../controllers/globalPay.controller.mjs';

router.post("/global-pay/pay", authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), payViaGlobalPay);

export default router
