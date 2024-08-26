import express from 'express'
const router = express.Router();
import { UserRoles } from "../enums/role.enums.mjs"
import { myRenters, myRenterHistory, getAllMyRenters, rentedProperties } from '../controllers/myrenter.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';

router.get('/my-renters', authorizer([UserRoles.LANDLORD]), myRenters);
router.get('/v2/my-renters', authorizer([UserRoles.LANDLORD]), getAllMyRenters);
router.get('/my-renter/history', authorizer([UserRoles.LANDLORD]), myRenterHistory);
router.get('/my-renter/properties/current-rented', authorizer([UserRoles.LANDLORD]), rentedProperties);


export default router;

