import express from 'express'
import { getEmployee , addEmployee, getEmployeeById, editEmployee, deleteEmployee } from '../controllers/manageemployee.controller.mjs';
const router = express.Router();

router.get('/employees', getEmployee);
router.post('/addEmployee' , addEmployee)
router.get('/employee', getEmployeeById);
router.put('/employee', editEmployee);
router.delete('/employee', deleteEmployee);




export default router;

