import express from 'express'
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import { addMaintenance , getMaintenanceRenter } from '../controllers/maintenance.controller.mjs';
const router = express.Router();

router.post('/maintenance' , authorizer([UserRoles.RENTER]), addMaintenance);

router.get('/maintenance' , authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), getMaintenanceRenter);

export default router;

