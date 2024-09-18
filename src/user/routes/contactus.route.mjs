import express from 'express';
const router = express.Router();
import * as ContactUsController from "../controllers/contactus.controller.mjs"

router.post("/contact-us", ContactUsController.addContactRequest)


export default router
