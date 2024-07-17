import express from 'express'
const router = express.Router();
import {authorizer} from "../middleware/authorizer.middleware.mjs"
import {UserRoles} from "../enums/role.enums.mjs"
import { myRenters } from '../controllers/myrenter.controller.mjs';

router.post('/my-renters' , authorizer([UserRoles.LANDLORD])  , myRenters);



export default router;

