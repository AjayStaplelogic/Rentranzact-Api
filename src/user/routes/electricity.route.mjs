import express from 'express';
const router = express.Router();
import * as electricity from "../controllers/electricity.controller.mjs"
import { UserRoles } from "../enums/role.enums.mjs";
import authorizer from '../middleware/authorizer.middleware.mjs';

router.get("/electricity/billers", authorizer([UserRoles.RENTER]), electricity.getAllBillers);
router.get("/electricity/billers/bills", authorizer([UserRoles.RENTER]), electricity.getAllBillerBills);
router.post("/electricity/billers/bills/validate", authorizer([UserRoles.RENTER]), electricity.payElectricityBill); 
router.get("/electricity/bill-history", authorizer([UserRoles.RENTER]), electricity.getBillHistory); 






export default router
