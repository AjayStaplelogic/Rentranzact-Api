import express from 'express'
import { financePerformance } from '../controllers/finance.controller.mjs';
const router = express.Router();

router.get('/finance/:year' , financePerformance);

export default router;

