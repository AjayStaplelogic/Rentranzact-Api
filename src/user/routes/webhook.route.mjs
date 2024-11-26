import express from 'express'
const router = express.Router();
import { flutterwave } from '../controllers/flutterwave.controller.mjs';
import { paystack, stripe } from '../controllers/stripes.controller.mjs';
import * as twakToController from "../controllers/twakto.controller.mjs"
import bodyParser from 'body-parser';

router.use(bodyParser.json({
    type: 'application/json',
    verify: function (req, res, buf) {
        req.rawBody = buf;
    }
}));

router.post('/flutterwave', flutterwave);
router.post('/stripe', stripe)
router.post('/paystack', paystack)
router.post('/twak-to', twakToController.twawToWebhook)
router.post('/electricity', test)

async function test(req, res) {

    console.log(req.body, "=========request")

    res.status(200).json({});
}

export default router;

