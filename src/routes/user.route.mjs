import express from 'express'
const router = express.Router();
import { login, signup, userVerification } from '../controllers/user.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';

// Define routes for users
router.post('/login' ,login);
router.post('/signup', signup);
router.post('/otpVerification' , userVerification )
// router.get('/users/:id', UserController.getUserById);
// router.post('/users', UserController.createUser);
// router.put('/users/:id', UserController.updateUser);
// router.delete('/users/:id', UserController.deleteUser);



export default router;

