import express from 'express'
import *as ActivityController from '../controllers/activity.controller.mjs';
const router = express.Router();

// router.get('/activity/:userID', activity);
router.get('/activity-logs', ActivityController.getAllActivityLogs);

export default router;

