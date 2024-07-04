import express from 'express'
const router = express.Router();
import { payRent } from '../controllers/stripe.controller.mjs';

// Define routes for users
router.post('/payRent' ,payRent);
// router.post('/signup', signup);
// router.get('/users/:id', UserController.getUserById);
// router.post('/users', UserController.createUser);
// router.put('/users/:id', UserController.updateUser);
// router.delete('/users/:id', UserController.deleteUser);



export default router;

