import express from 'express'
const router = express.Router();
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import { myTransaction , transactionById, getAllRentTransactions, downloadTransactionPdf } from '../controllers/transaction.controller.mjs';

router.get('/my-transactions' , authorizer([UserRoles.RENTER , UserRoles.LANDLORD , UserRoles.PROPERTY_MANAGER]) ,  myTransaction);

router.get('/transaction/:id' , authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]) , transactionById);

router.get('/transactions/rent' , authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER ]) ,  getAllRentTransactions);

router.get('/transactions/download' , authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER ]),  downloadTransactionPdf);




export default router;

