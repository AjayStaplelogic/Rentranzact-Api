import express from 'express'
const router = express.Router();
import { newsletter } from '../controllers/newsletter.controller.mjs';


router.post('/subscribe-newsletter' ,newsletter);



export default router;

