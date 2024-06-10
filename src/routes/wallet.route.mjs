import express from 'express'
const router = express.Router();
import authorizer from '../middleware/authorizer.middleware.mjs';
import { addInWallet } from '../controllers/wallet.controller.mjs';
import { UserRoles } from '../enums/role.enums.mjs';

// Define routes for users
router.post('/addInWallet' ,addInWallet);
// router.post('/signup', signup);
// router.get('/users/:id', UserController.getUserById);
// router.post('/users', UserController.createUser);
// router.put('/users/:id', UserController.updateUser);
// router.delete('/users/:id', UserController.deleteUser);



export default router;

