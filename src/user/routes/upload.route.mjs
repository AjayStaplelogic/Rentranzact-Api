import express from 'express'
const router = express.Router();
import { UserRoles } from "../enums/role.enums.mjs"
import * as uploadController from '../controllers/upload.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import * as Multer from '../helpers/multer.mjs';


router.post('/upload/image', authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), Multer.upload.single("media"), uploadController.uploadSingleImage);

export default router;

