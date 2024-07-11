import express from 'express'
import { getNotification } from '../controllers/notification.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
const router = express.Router();


router.get('/notification'  , authorizer([UserRoles.RENTER]), getNotification);



export default router;

