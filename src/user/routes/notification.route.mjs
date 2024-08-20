import express from 'express'
import { getNotification, getAllNotifications } from '../controllers/notification.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
const router = express.Router();


router.get('/notification', authorizer([UserRoles.RENTER]), getNotification);
router.get('/notifications', authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), getAllNotifications);




export default router;

