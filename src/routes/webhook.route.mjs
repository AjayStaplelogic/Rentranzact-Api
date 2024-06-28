import express from 'express'
const router = express.Router();
import { idVerification } from '../controllers/webhook.controller.mjs';


router.post('/idVerification' ,idVerification);



export default router;

