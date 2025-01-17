import express from 'express'
const router = express.Router();
import { flutterwave, flutterwaveRefundsWehook } from '../controllers/flutterwave.controller.mjs';
import { paystack, stripe } from '../controllers/stripes.controller.mjs';
import * as twakToController from "../controllers/twakto.controller.mjs"

router.post('/flutterwave', flutterwave);
router.post('/flutterwave/refunds', flutterwaveRefundsWehook);
router.post('/stripe', stripe)
router.post('/paystack', paystack)
router.post('/twak-to', twakToController.twawToWebhook)

export default router;

