import express from 'express'
const router = express.Router();
import { newsletter } from '../controllers/newsletter.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import { addProperty } from '../controllers/property.controller.mjs';
import multer from 'multer';


const upload = multer({ dest: 'uploads/' });

router.post('/property' , authorizer([UserRoles.LANDLORD]) , upload.any(), addProperty);



export default router;

