import express from 'express'
const router = express.Router();

import { 
    dashboard, 
    getUserOnboardingStats,
    getUserOnboardingStatsPercentage,
    getRevenueStats,
    getFinancialPerformanceStats
} from '../controllers/dashboard.controller.mjs';


// Define routes for users
router.get('/dashboard' , dashboard);
router.get('/dashboard/user-onboarded/stats' , getUserOnboardingStats);
router.get('/dashboard/user-onboarded/stats/per' , getUserOnboardingStatsPercentage);
router.get('/dashboard/revenue/stats' , getRevenueStats);
router.get('/dashboard/financial-performance/stats' , getFinancialPerformanceStats);



export default router;

