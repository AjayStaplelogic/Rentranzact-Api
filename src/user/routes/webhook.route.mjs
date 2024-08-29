import express from 'express'
const router = express.Router();
import { flutterwave } from '../controllers/flutterwave.controller.mjs';
import { paystack, stripe } from '../controllers/stripes.controller.mjs';


router.post('/flutterwave'  ,flutterwave);
router.post('/stripe' , stripe)
router.post('/paystack' , paystack)

export default router;

