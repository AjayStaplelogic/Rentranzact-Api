import express from 'express'
const router = express.Router();
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import { myTransaction } from '../controllers/transaction.controller.mjs';

router.get('/my-transactions' , authorizer([UserRoles.RENTER , UserRoles.LANDLORD , UserRoles.PROPERTY_MANAGER]) ,  myTransaction);

export default router;

