import express from "express";
const router = express.Router();

import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import {adddummyTransaction} from "../controllers/dummy.controller.mjs"

router.post("/transaction", authorizer([UserRoles.RENTER]) , adddummyTransaction)

export default router;
