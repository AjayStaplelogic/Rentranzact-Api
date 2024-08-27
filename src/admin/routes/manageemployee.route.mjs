import express from 'express'
import { getEmployee , addEmployee, getEmployeeById, editEmployee, deleteEmployee, updateEmployeeStatus } from '../controllers/manageemployee.controller.mjs';
const router = express.Router();

router.get('/employees', getEmployee);
router.post('/addEmployee' , addEmployee)
router.get('/employee', getEmployeeById);
router.put('/employee', editEmployee);
router.delete('/employee', deleteEmployee);
router.put('/employee/update-status', updateEmployeeStatus);





export default router;

