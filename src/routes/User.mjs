import express from 'express'
const router = express.Router();
import { login, signup } from '../controllers/user.mjs';
import authorizer from '../helpers/authorizer.mjs';

// Define routes for users
router.post('/login', authorizer ,login);
router.post('/signup', signup);
// router.get('/users/:id', UserController.getUserById);
// router.post('/users', UserController.createUser);
// router.put('/users/:id', UserController.updateUser);
// router.delete('/users/:id', UserController.deleteUser);
//new change in ajay testing


export default router;

