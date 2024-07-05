import express from 'express'
import { getEmployee } from '../controllers/manageemployee.controller.mjs';
const router = express.Router();

router.get('/employees', getEmployee);
// router.delete('/roles/:id' , deleteRole);
// router.put("/roles/:id" , updateRoles);

export default router;

