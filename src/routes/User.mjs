import express from 'express'
const router = express.Router();
import { login } from '../controllers/user.mjs';

// Define routes for users
router.get('/login', login);
// router.get('/users/:id', UserController.getUserById);
// router.post('/users', UserController.createUser);
// router.put('/users/:id', UserController.updateUser);
// router.delete('/users/:id', UserController.deleteUser);


export default router;
