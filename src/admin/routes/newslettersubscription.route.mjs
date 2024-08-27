import express from 'express'
const router = express.Router();
import * as NewsLetterSubscriptionController from '../controllers/newslettersubscription.controller.mjs';

router.get('/news-letter/subscriptions', NewsLetterSubscriptionController.getAllSubscriptions);


export default router;

