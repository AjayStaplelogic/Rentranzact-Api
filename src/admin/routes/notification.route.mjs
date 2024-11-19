import express from 'express'
import { getAllNotifications, getNotificationById } from '../controllers/notification.controller.mjs';
const router = express.Router();


router.get('/notifications', getAllNotifications);
router.get('/notification/view', getNotificationById);

export default router;

