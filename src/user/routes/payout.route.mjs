import express from 'express';
const router = express.Router();
import * as PayoutController from "../controllers/payouts.controller.mjs"
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

router.post("/payout", authorizer([UserRoles.LANDLORD, UserRoles.RENTER, UserRoles.PROPERTY_MANAGER]), PayoutController.createPayout);
router.get("/payouts", authorizer([UserRoles.LANDLORD, UserRoles.RENTER, UserRoles.PROPERTY_MANAGER]), PayoutController.getPayouts);



export default router
