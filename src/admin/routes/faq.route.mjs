import express from 'express'
const router = express.Router();
import * as FaqController from "../controllers/faq.controller.mjs"

// Define routes for Faqs
router.post('/faq', FaqController.addFaq);
router.put('/faq', FaqController.editFaq);
router.get('/faqs', FaqController.getAllFaqs);
router.get('/faq', FaqController.getFaqById);
router.delete('/faq', FaqController.deleteFaqById);

export default router;

