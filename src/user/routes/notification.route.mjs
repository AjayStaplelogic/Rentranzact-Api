import express from 'express'
import { getNotification, getAllNotifications, getNotificationById, readUnreadNotification } from '../controllers/notification.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
const router = express.Router();


router.get('/notification', authorizer([UserRoles.RENTER]), getNotification);
router.get('/notifications', authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), getAllNotifications);
router.get('/notification/view', authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), getNotificationById);
router.put('/notification/read-unread', authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), readUnreadNotification);





export default router;

