import express from 'express'
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import { addMaintenance } from '../controllers/maintenance.controller.mjs';
const router = express.Router();

router.post('/maintenance' , authorizer([UserRoles.RENTER]), addMaintenance);

export default router;

