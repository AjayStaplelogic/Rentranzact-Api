import express from 'express'
import { getEmployee , addEmployee } from '../controllers/manageemployee.controller.mjs';
const router = express.Router();

router.get('/employees', getEmployee);
router.post('/addEmployee' , addEmployee)
// router.delete('/roles/:id' , deleteRole);
// router.put("/roles/:id" , updateRoles);

export default router;

