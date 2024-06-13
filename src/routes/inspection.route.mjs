import express from "express";
const router = express.Router();
import { addInspection } from "../controllers/inspection.controller.mjs";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

router.post("/inspection", authorizer([UserRoles.RENTER]), addInspection);

export default router;
