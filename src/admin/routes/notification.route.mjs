import express from 'express'
import { getAllNotifications, getNotificationById, readUnreadNotification } from '../controllers/notification.controller.mjs';
const router = express.Router();


router.get('/notifications', getAllNotifications);
router.get('/notification/view', getNotificationById);
router.put('/notification/read-unread', readUnreadNotification);

export default router;

