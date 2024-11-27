import express from 'express';
const router = express.Router();
import * as CreditScoreController from "../controllers/creditscore.controller.mjs"
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

router.post("/credit-score", authorizer([UserRoles.LANDLORD, UserRoles.RENTER, UserRoles.PROPERTY_MANAGER]), CreditScoreController.addUpdateCreditScore);
router.get("/credit-score", authorizer([UserRoles.LANDLORD, UserRoles.RENTER, UserRoles.PROPERTY_MANAGER]), CreditScoreController.getCreditScore);



export default router
