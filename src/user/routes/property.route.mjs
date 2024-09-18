import express from "express";
const router = express.Router();
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { generateRandomFileName } from "../helpers/randomNameGenerator.mjs";
import {
  addProperty,
  searchProperty,
  propertiesList,
  propertyByID,
  addFavorite,
  searchPropertyByKeywords,
  myProperties,
  leaveProperty,
  getAllProperties,
  deleteProperty,
  getPropertyManagerList,
  getPropertyManagerDetails,
  getPropertyListByPmID,
  teminatePM,
  editProperty
} from "../controllers/property.controller.mjs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from 'url';

const PropertyID = uuidv4();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to generate and attach PropertyID
router.use((req, res, next) => {
  req.PropertyID = PropertyID;
  req.images = [];
  req.documents = [];
  req.videos = [];
  next();
});

const baseUploadPath = "uploads/";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const propertyFolder = path.join(baseUploadPath, PropertyID);
    const imagesFolder = path.join(propertyFolder, "images");
    const documentsFolder = path.join(propertyFolder, "documents");
    const videosFolder = path.join(propertyFolder, "videos");

    const thumbnailFolder = path.join(propertyFolder, "images", "thumbnails")

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

    if (!fs.existsSync(thumbnailFolder)) {
      fs.mkdirSync(thumbnailFolder);
    }

    // Determine subfolder based on file type
    let destinationFolder = propertyFolder;
    if (file.mimetype.startsWith("image/")) {
      destinationFolder = imagesFolder;
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("application/")
    ) {
      destinationFolder = documentsFolder;
    } else if (file.mimetype.startsWith("video/")) {
      destinationFolder = videosFolder;
    }

    cb(null, destinationFolder);
  },
  // filename: function (req, file, cb) {
  //   // Ensure the filename includes the original file extension
  //   cb(null, file.originalname);
  // },

  filename: function (req, file, cb) {
    const randomFileName = generateRandomFileName(file);
    cb(null, randomFileName);
  },
});

const upload = multer({ storage: storage });
const hostUrl = process.env.HOST_URL;

router.post("/property/search", searchProperty);

router.post("/property/list", propertiesList);
router.get("/property/:id", propertyByID);
router.get(
  "/property/favorite/:id",
  authorizer([UserRoles.RENTER]),
  addFavorite
);
async function createThumbnail(filePath, thumbnailPath, width, height) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(parseInt(width), parseInt(height))
      .toBuffer();
    fs.writeFileSync(thumbnailPath, thumbnailBuffer);
  } catch (error) {
    console.error('Error creating thumbnail:', error);
  }
}

router.post(
  "/property",
  authorizer([
    UserRoles.LANDLORD,
    UserRoles.PROPERTY_MANAGER,
    UserRoles.RENTER,
  ]),
  upload.any(),
  (req, res) => {

    req.files.forEach(async (file) => {
      const thumbnailWidth = 89; // Set your desired thumbnail width
      const thumbnailHeight = 68; // Set your desired thumbnail height
      const randomFileName = file.filename; // Use the random filename generated by Multer
      const relativePath = path.join(
        hostUrl,
        "property",
        req.PropertyID.toString(),
        file.mimetype.startsWith("image/")
          ? "images"
          : file.mimetype.startsWith("video/")
            ? "videos"
            : "documents",
        randomFileName // Use random filename instead of file.originalname
      );


      if (file.mimetype.startsWith("image/")) {

        const relativePath2 = path.join(hostUrl, "property", req.PropertyID.toString(), "images", "thumbnails", randomFileName)
        const relativePath3 = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', 'thumbnails', randomFileName);
        req.images.push({ id: uuidv4(), url: relativePath, thumbnail: relativePath2 });
        // Create and save the thumbnail
        await createThumbnail(file.path, relativePath3, thumbnailWidth, thumbnailHeight);
      } else if (file.mimetype.startsWith("video/")) {
        req.videos.push({ id: uuidv4(), url: relativePath });
      } else if (file.mimetype.startsWith("application/")) {
        req.documents.push({ id: uuidv4(), url: relativePath });
      }




    });

    addProperty(req, res);
  }
);

router.get(
  "/property",
  authorizer([UserRoles.RENTER]),
  searchPropertyByKeywords
);

router.get("/my-properties", authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), myProperties)

router.post("/leave-property/:id", authorizer([UserRoles.RENTER]), leaveProperty)

router.get("/properties", getAllProperties)

router.delete("/property/:id", authorizer([UserRoles.LANDLORD]), deleteProperty)

router.get("/property-managers", authorizer([UserRoles.LANDLORD]), getPropertyManagerList)

router.get("/property-manager/:id", authorizer([UserRoles.LANDLORD]), getPropertyManagerDetails)

router.get("/property-manager-property-lists/:id", authorizer([UserRoles.LANDLORD]), getPropertyListByPmID)

router.get("/terminate-property-manager/:id", authorizer([UserRoles.LANDLORD]), teminatePM)

router.put("/property/edit", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]),
  upload.any(),
  (req, res) => {
    req.files.forEach(async (file) => {
      const thumbnailWidth = 89; // Set your desired thumbnail width
      const thumbnailHeight = 68; // Set your desired thumbnail height
      const randomFileName = file.filename; // Use the random filename generated by Multer
      const relativePath = path.join(
        hostUrl,
        "property",
        req.PropertyID.toString(),
        file.mimetype.startsWith("image/")
          ? "images"
          : file.mimetype.startsWith("video/")
            ? "videos"
            : "documents",
        randomFileName // Use random filename instead of file.originalname
      );


      console.log(file, '=======file111')
      console.log(file.mimetype.startsWith("image/"), '=======file.mimetype.startsWith("image/")111')

      if (file.mimetype.startsWith("image/")) {
        console.log("Changes file memetppe")

        const relativePath2 = path.join(hostUrl, "property", req.PropertyID.toString(), "images", "thumbnails", randomFileName)
        const relativePath3 = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', 'thumbnails', randomFileName);
        req.images.push({ id: uuidv4(), url: relativePath, thumbnail: relativePath2 });
        // Create and save the thumbnail
        await createThumbnail(file.path, relativePath3, thumbnailWidth, thumbnailHeight);
      } else if (file.mimetype.startsWith("video/")) {
        req.videos.push({ id: uuidv4(), url: relativePath });
      } else if (file.mimetype.startsWith("application/")) {
        req.documents.push({ id: uuidv4(), url: relativePath });
      }

    });
    editProperty(req, res)
  },
)


export default router;














