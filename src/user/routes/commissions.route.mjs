import express from 'express';
const router = express.Router();
import * as CommissionsController from "../controllers/commissions.controller.mjs"
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

router.get("/commissions", authorizer([UserRoles.PROPERTY_MANAGER]), CommissionsController.getCommissions);


export default router
