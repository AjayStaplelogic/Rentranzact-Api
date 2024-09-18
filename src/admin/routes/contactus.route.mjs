import express from 'express'
const router = express.Router();
import * as ContactUsController from '../controllers/contactus.controller.mjs';

router.get('/contact-us/all', ContactUsController.getAllRequests);
router.get('/contact-us', ContactUsController.getRequestById);



export default router;

