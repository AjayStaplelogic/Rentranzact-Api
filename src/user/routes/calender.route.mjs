import express from "express";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { calender , getCalender , getTimeSlot} from "../controllers/calender.controller.mjs";
const router = express.Router();

router.post("/calender", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , calender);
router.get("/calender", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , getCalender)
router.get("/timeslot/:date", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , getTimeSlot)

export default router;
