import express from "express";
const router = express.Router();
import {
  addInspection,
  getInsepction,
  inspectionUpdate,
  inspectionEdit,
  getInspectionRequests,
  getAvailableDates,
  searchInspection,
  getAllInspections,
  getInspectionById
} from "../controllers/inspection.controller.mjs";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

router.post("/inspection", authorizer([UserRoles.RENTER]), addInspection);
router.get(
  "/inspection",
  authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER]),
  getInsepction
);

router.get(
  "/inspection/search",
  authorizer([UserRoles.RENTER]),
  searchInspection
);

router.post(
  "/inspection/update-status",
  authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER]),
  inspectionUpdate
);

router.post(
  "/inspection/edit",
  authorizer([UserRoles.RENTER]),
  inspectionEdit)

router.get("/inspections/:id", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), getInspectionRequests)


router.get("/available-inspection-dates/:id", authorizer([UserRoles.RENTER]), getAvailableDates)


router.get("/inspections", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER]), getAllInspections);

router.get("/inspection/by-id", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER]), getInspectionById);


export default router;
