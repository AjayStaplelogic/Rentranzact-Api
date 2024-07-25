import express from 'express'
const router = express.Router();
import { addUser , userList , user , deleteUser , searchUsers} from '../controllers/manageuser.controller.mjs';

router.post('/addUser' ,addUser);
router.post('/userList', userList);
router.get('/user', searchUsers)
router.get('/user/:id' , user )
router.delete('/user/:id' , deleteUser)

export default router;

