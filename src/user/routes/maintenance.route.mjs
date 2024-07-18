import express from 'express'
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import { addMaintenance , getMaintenanceRenter , resolveMaintenance , addRemark } from '../controllers/maintenance.controller.mjs';
const router = express.Router();

router.post('/maintenance' , authorizer([UserRoles.RENTER]), addMaintenance);

router.get('/maintenance' , authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), getMaintenanceRenter);

router.get('/maintenance/:id' , authorizer([UserRoles.LANDLORD]) , resolveMaintenance);

router.get('/maintenance/:id' , authorizer([UserRoles.LANDLORD]) , resolveMaintenance);

router.post('/maintenance/remark' ,  authorizer([UserRoles.LANDLORD]) ,addRemark)

export default router;

