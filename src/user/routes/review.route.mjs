import express from 'express'
const router = express.Router();
import { UserRoles } from "../enums/role.enums.mjs"
import * as reviewController from '../controllers/review.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';


router.post('/review', authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), reviewController.addUpdateReview);
router.get('/reviews', reviewController.getAllReviews);
router.get('/review', reviewController.getReviewById);
router.put('/review/change-status', reviewController.changeReviewStatus);
router.delete('/review', reviewController.deleteReview);


export default router;

