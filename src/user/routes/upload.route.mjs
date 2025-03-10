import express from 'express'
const router = express.Router();
import { UserRoles } from "../enums/role.enums.mjs"
import * as uploadController from '../controllers/upload.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import * as Multer from '../helpers/multer.mjs';
import rateLimitter from "../middleware/ratelimitter.middleware.mjs";
const newRateLimitter = rateLimitter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 requests per minute
})

router.post('/upload/image', newRateLimitter, authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), Multer.upload.single("media"), uploadController.uploadSingleImage);
router.post('/upload/file/multiple', newRateLimitter, authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), uploadController.uploadMultipleFiles);
router.delete('/delete/file', authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), uploadController.deleteFile);
router.post('/admin/upload/file/multiple', newRateLimitter, uploadController.uploadMultipleFilesByAdmin); // Created separate because admin doesn't have access token
router.post('/bucket/delete/file/multiple', authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), uploadController.deleteFilesFromS3);
router.post('/admin/bucket/delete/file/multiple', uploadController.deleteFilesFromS3);
export default router;

