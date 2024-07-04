import express from "express"
const router = express.Router();
import { dashbordStats } from "../controllers/dashbord.controller.mjs";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

router.get(
  "/dashboard",
  authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]),
  dashbordStats
);

export default router;
