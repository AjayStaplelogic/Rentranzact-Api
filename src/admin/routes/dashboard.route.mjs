import express from 'express'
const router = express.Router();

import { 
    dashboard, 
    getUserOnboardingStats,
    getUserOnboardingStatsPercentage,
    getRevenueStats
} from '../controllers/dashboard.controller.mjs';


// Define routes for users
router.get('/dashboard' , dashboard);
router.get('/dashboard/user-onboarded/stats' , getUserOnboardingStats);
router.get('/dashboard/user-onboarded/stats/per' , getUserOnboardingStatsPercentage);
router.get('/dashboard/revenue/stats' , getRevenueStats);


export default router;

