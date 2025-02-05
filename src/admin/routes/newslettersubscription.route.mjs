import express from 'express'
const router = express.Router();
import * as NewsLetterSubscriptionController from '../controllers/newslettersubscription.controller.mjs';

router.get('/news-letter/subscriptions', NewsLetterSubscriptionController.getAllSubscriptions);
router.delete('/news-letter/subscription', NewsLetterSubscriptionController.deleteNewsletterSubscription);
router.patch('/news-letter/subscription/update-status', NewsLetterSubscriptionController.updateNewsletterSubscriptionStatus);
router.get('/news-letter/subscriptions/download-xlxs', NewsLetterSubscriptionController.downloadXlxs);


export default router;

