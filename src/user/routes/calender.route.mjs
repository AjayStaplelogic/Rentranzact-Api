import express from "express";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { calender , getCalender , getTimeSlot, getCalenderTimeSlots} from "../controllers/calender.controller.mjs";
const router = express.Router();

router.post("/calender", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , calender);
router.get("/calender", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , getCalender)
router.post("/timeslot", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , getTimeSlot)
router.get("/calender/timeslot", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , getCalenderTimeSlots)

export default router;
