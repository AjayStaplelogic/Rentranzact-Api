import express from 'express'
const router = express.Router();
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import { myTransaction , transactionById, getAllRentTransactions } from '../controllers/transaction.controller.mjs';

router.get('/my-transactions' , authorizer([UserRoles.RENTER , UserRoles.LANDLORD , UserRoles.PROPERTY_MANAGER]) ,  myTransaction);

router.get('/transaction/:id' , authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]) , transactionById);

router.get('/transactions/rent' , authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER ]) ,  getAllRentTransactions);



export default router;

