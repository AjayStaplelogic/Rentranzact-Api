import express from "express";
const router = express.Router();
import {
  addInspection,
  getInsepction,
  inspectionUpdate,
  inspectionEdit ,

  getAvailableDates
} from "../controllers/inspection.controller.mjs";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

router.post("/inspection", authorizer([UserRoles.RENTER]), addInspection);
router.get(
  "/inspection",
  authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER , UserRoles.RENTER]),
  getInsepction
);
router.post(
  "/inspection/update-status",
  authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER , UserRoles.RENTER]),
  inspectionUpdate
);

router.post(
  "/inspection/edit",
  authorizer([UserRoles.RENTER]),
  inspectionEdit)


router.get("/available-inspection-dates/:id" , authorizer([UserRoles.RENTER]) , getAvailableDates)







export default router;
