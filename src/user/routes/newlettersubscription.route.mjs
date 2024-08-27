import express from 'express'
const router = express.Router();
import * as NewsLetterSubscriptionController from '../controllers/newslettersubscription.controller.mjs';

router.post('/news-letter/subscription', NewsLetterSubscriptionController.subscribeNewLetter);


export default router;

