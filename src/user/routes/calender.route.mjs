import express from "express";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { calender , getCalender , getTimeSlot, getCalenderTimeSlots, getCalenderBlockedSlots, blockMultipleTimeSlots} from "../controllers/calender.controller.mjs";
const router = express.Router();

router.post("/calender", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , calender);
router.get("/calender", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , getCalender)
router.post("/timeslot", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , getTimeSlot)
router.get("/calender/timeslot", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , getCalenderTimeSlots)
router.get("/calender/blocked-timeslot", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]) , getCalenderBlockedSlots)
router.post("/calender/block/slot/multiple", authorizer([UserRoles.LANDLORD]) , blockMultipleTimeSlots);


export default router;
