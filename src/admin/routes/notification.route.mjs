import express from 'express'
import { getAllNotifications, getNotificationById, readUnreadNotification, manualCreateNotification } from '../controllers/notification.controller.mjs';
const router = express.Router();


router.get('/notifications', getAllNotifications);
router.get('/notification/view', getNotificationById);
router.put('/notification/read-unread', readUnreadNotification);
router.post('/notification/custom', manualCreateNotification);


export default router;

