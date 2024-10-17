import express from 'express';
const router = express.Router();
import * as AccountsController from "../controllers/accounts.controller.mjs"
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

router.post("/connect-account", authorizer([UserRoles.LANDLORD, UserRoles.RENTER, UserRoles.PROPERTY_MANAGER]), AccountsController.createConnectedAccount);
router.get("/connect-account", authorizer([UserRoles.LANDLORD, UserRoles.RENTER, UserRoles.PROPERTY_MANAGER]), AccountsController.getConnectedAccount);
router.get("/connect-account/bank-accounts", authorizer([UserRoles.LANDLORD, UserRoles.RENTER, UserRoles.PROPERTY_MANAGER]), AccountsController.getAllAccounts);


export default router
