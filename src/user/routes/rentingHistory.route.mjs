import express from 'express'
const router = express.Router();
import { UserRoles } from "../enums/role.enums.mjs"
import { myRenters, viewMyRenter, getAllMyRenters } from '../controllers/myrenter.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';

router.get('/my-renters', authorizer([UserRoles.LANDLORD]), myRenters);
router.get('/v2/my-renters', authorizer([UserRoles.LANDLORD]), getAllMyRenters);
router.get('/my-renter', authorizer([UserRoles.LANDLORD]), viewMyRenter);

export default router;

