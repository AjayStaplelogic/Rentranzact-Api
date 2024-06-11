import express from 'express'
const router = express.Router();
import { newsletter } from '../controllers/newsletter.controller.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import { addProperty } from '../controllers/property.controller.mjs';
import multer from 'multer';



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Specify the destination directory
    },
    filename: function (req, file, cb) {
      // Ensure the filename includes the original file extension
      cb(null, file.originalname);
    }
  });

  const upload = multer({ storage: storage });

// router.post('/property' , authorizer([UserRoles.LANDLORD]) , upload.any(), addProperty);

router.post('/property'  , upload.any(), addProperty);


export default router;

