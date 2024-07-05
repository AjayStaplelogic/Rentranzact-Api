import express from 'express'
const router = express.Router();
import { addRole , getRole , deleteRole , updateRoles} from '../controllers/role.controller.mjs';

// Define routes for users
router.post('/roles', addRole);
router.get('/roles', getRole);
router.delete('/roles/:id' , deleteRole);
router.put("/roles/:id" , updateRoles);

export default router;

