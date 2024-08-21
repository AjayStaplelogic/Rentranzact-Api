import express from 'express'
import { activity } from '../controllers/activity.controller.mjs';
const router = express.Router();

router.get('/activity/:userID', activity);

export default router;

