import express from 'express'
import { getTransaction } from '../controllers/transaction.route.mjs';
const router = express.Router();



router.get('/transactions', getTransaction);


export default router;

