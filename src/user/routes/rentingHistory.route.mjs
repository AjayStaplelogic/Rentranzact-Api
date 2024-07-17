import express from 'express'
const router = express.Router();
import {UserRoles} from "../enums/role.enums.mjs"
import { myRenters } from '../controllers/myrenter.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';

s

router.post('/my-renters' , authorizer([UserRoles.LANDLORD])  , myRenters);

export default router;

