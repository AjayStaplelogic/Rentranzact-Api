import express from 'express'
const router = express.Router();
import * as TransferController from "../controllers/transfers.controller.mjs"

// Define routes for Faqs
router.get('/transfers', TransferController.getAllTransfers);
router.get('/transfer', TransferController.getTransferById);
router.put('/transfer/initiate-approval', TransferController.updateInitiateApprovalStatus); // Step 1: Initiate 
router.put('/transfer/update-approval', TransferController.updateApprovalStatus); // Step 2: Update Approval
router.put('/transfer/update-status', TransferController.updateTransferStatus);  // Step 3 : transfer
router.put('/transfer/update-transfer-date', TransferController.updateTransferDate);  

export default router;

