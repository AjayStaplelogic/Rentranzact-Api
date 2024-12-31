import express from 'express'
const router = express.Router();
import * as TransferController from "../controllers/transfers.controller.mjs"

// Define routes for Faqs
router.get('/transfers', TransferController.getAllTransfers);
router.get('/transfer', TransferController.getTransferById);
router.put('/transfer/update-status', TransferController.updateTransferStatus);
router.put('/transfer/update-approval', TransferController.updateApprovalStatus);
router.put('/transfer/initiate-approval', TransferController.updateInitiateApprovalStatus);



export default router;

