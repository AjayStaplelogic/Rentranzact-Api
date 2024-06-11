import express from "express";
const router = express.Router();
import { newsletter } from "../controllers/newsletter.controller.mjs";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { addProperty } from "../controllers/property.controller.mjs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from 'fs';
import path from "path";

const PropertyID = uuidv4();

// Middleware to generate and attach PropertyID
router.use((req, res, next) => {
  req.PropertyID = PropertyID;
  req.images = [];
  req.documents = [];
  req.videos = [];
  next();
});


const baseUploadPath = 'uploads/';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const propertyFolder = path.join(baseUploadPath, PropertyID);
    const imagesFolder = path.join(propertyFolder, 'images');
    const documentsFolder = path.join(propertyFolder, 'documents');
    const videosFolder = path.join(propertyFolder, 'videos');

    // Create the directories if they don't exist
    if (!fs.existsSync(propertyFolder)) {
      fs.mkdirSync(propertyFolder, { recursive: true });
    }
    if (!fs.existsSync(imagesFolder)) {
      fs.mkdirSync(imagesFolder);
    }
    if (!fs.existsSync(documentsFolder)) {
      fs.mkdirSync(documentsFolder);
    }
    if (!fs.existsSync(videosFolder)) {
      fs.mkdirSync(videosFolder);
    }

    // Determine subfolder based on file type
    let destinationFolder = propertyFolder;
    if (file.mimetype.startsWith('image/')) {
      destinationFolder = imagesFolder;
    } else if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('application/')) {
      destinationFolder = documentsFolder;
    } else if (file.mimetype.startsWith('video/')) {
      destinationFolder = videosFolder;
    }

    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    // Ensure the filename includes the original file extension
    cb(null, file.originalname);
  },
});


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Specify the destination directory
//   },
//   filename: function (req, file, cb) {
//     // Ensure the filename includes the original file extension
//     cb(null, file.originalname);
//   },
// });

const upload = multer({ storage: storage });

router.post('/property', upload.any(), (req, res) => {
  // Attach file paths to req.body
  req.files.forEach(file => {

    console.log(req.PropertyID , "reqm body")

    console.log(file.originalname,"file.originalname" , typeof req.body.PropertyID," file.mimetype." )
    const relativePath = path.join('https://api.rentranzact.com','property', req.PropertyID, file.mimetype.startsWith('image/') ? 'images' : file.mimetype.startsWith('video/') ? 'videos' : 'documents', file.originalname);
    





    if (file.mimetype.startsWith('image/')) {
      req.images.push(relativePath);
    } else if (file.mimetype.startsWith('video/')) {
      req.videos.push(relativePath);
    } else if (file.mimetype.startsWith('application/')) {
      req.documents.push(relativePath);
    }
  });

  addProperty(req, res);
});

// router.post("/property", upload.any(), addProperty);



// router.post('/property' , authorizer([UserRoles.LANDLORD]) , upload.any(), addProperty);

export default router;
