import express from 'express'
const router = express.Router();
import * as TestimonialController from "../controllers/testimonials.controller.mjs"
import * as TestimonialServices from "../services/testimonials.service.mjs"

// Define routes for testimonials
router.post('/testimonial', TestimonialServices.upload.single("file"), TestimonialController.addTestimonial);
router.put('/testimonial', TestimonialServices.upload.single("file"), TestimonialController.editTestimonial);
router.get('/testimonials', TestimonialController.getAllTestimonials);
router.get('/testimonial', TestimonialController.getTestimonialById);
router.delete('/testimonial', TestimonialController.deleteTestimonial);


export default router;

