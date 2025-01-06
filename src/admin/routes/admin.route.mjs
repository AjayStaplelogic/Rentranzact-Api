import express from 'express'
const router = express.Router();
import { signup, login, getProfile, editProfile } from '../controllers/admin.controller.mjs';

// Define routes for users
router.post('/login', login);
router.post('/signup', signup);
router.get('/profile', getProfile);
router.put('/profile', editProfile);

export default router;

