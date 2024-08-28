import express from 'express'
const router = express.Router();
import { addUser , userList , user , deleteUser , searchUsers, updateStatus, updateAccountStatus} from '../controllers/manageuser.controller.mjs';

router.post('/addUser' ,addUser);
router.post('/userList', userList);
router.get('/user', searchUsers)
router.get('/user/:id' , user )
router.delete('/user/:id' , deleteUser);
router.get('/update-status/:id' , updateStatus);
router.put('/user/update-account-status', updateAccountStatus);

export default router;

