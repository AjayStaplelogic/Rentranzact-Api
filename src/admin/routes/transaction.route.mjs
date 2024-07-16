import express from 'express'
import { getTransaction } from '../controllers/transaction.route.mjs';
const router = express.Router();



router.get('/transaction', getTransaction);


export default router;

