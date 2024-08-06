import express from 'express'
const router = express.Router();
import { flutterwave } from '../controllers/flutterwave.controller.mjs';
import { stripe } from '../controllers/stripes.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';

router.post('/flutterwave'  ,flutterwave);
router.post('/stripe' , stripe)



export default router;

