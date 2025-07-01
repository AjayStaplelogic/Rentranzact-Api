import express from 'express';
const router = express.Router();
import * as bankAccountController from "../controllers/bankAccount.controller.mjs";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

router.post("/bank-account", authorizer([UserRoles.LANDLORD, UserRoles.RENTER, UserRoles.PROPERTY_MANAGER]), bankAccountController.verifyAndUpdateBankAccount);
router.get("/bank-account", authorizer([UserRoles.LANDLORD, UserRoles.RENTER, UserRoles.PROPERTY_MANAGER]), bankAccountController.getBankAccount);


export default router
