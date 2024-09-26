import express from 'express';
const router = express.Router();
import * as CommissionsController from "../controllers/commissions.controller.mjs"

router.get("/commissions", CommissionsController.getCommissions);


export default router
