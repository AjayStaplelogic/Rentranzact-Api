import express from 'express'
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import { addMaintenance , getMaintenanceRenter , resolveMaintenance , addRemark , cancelMaintenace } from '../controllers/maintenance.controller.mjs';
const router = express.Router();

router.post('/maintenance' , authorizer([UserRoles.RENTER]), addMaintenance);

router.get('/maintenance' , authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), getMaintenanceRenter);

router.get('/maintenance/:id' , authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]) , resolveMaintenance);

router.get('/maintenance/cancel/:id', authorizer([UserRoles.RENTER]) , cancelMaintenace)


router.post('/maintenance/remark' ,  authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]) ,addRemark)

export default router;

