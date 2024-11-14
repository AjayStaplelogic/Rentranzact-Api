import express from 'express';
const router = express.Router();
import * as InviteController from "../controllers/invite.controller.mjs"
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

router.post("/invite", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), InviteController.inviteRenter);



export default router
