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
  editProperty,
  getAllPropertiesDropdown
} from "../controllers/property.controller.mjs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from 'url';
import * as s3Service from "../services/s3.service.mjs";

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
    const compressedFolder = path.join(propertyFolder, "images", "compressed")

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

    if (!fs.existsSync(compressedFolder)) {
      fs.mkdirSync(compressedFolder);
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
  filename: function (req, file, cb) {
    const randomFileName = generateRandomFileName(file);
    cb(null, randomFileName);
  },
});


const upload = multer({ storage: storage });
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
async function compressImages(filePath, thumbnailPath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);

    // Compress and save the image
    const thumbnailBuffer = await sharp(imageBuffer)
      .webp({ quality: 20 }) // Set the quality to 40 (adjust as needed)
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
  async (req, res) => {
    if (req?.files?.length > 0) {
      for await (let file of req.files) {
        const thumbnailWidth = 89; // Set your desired thumbnail width
        const thumbnailHeight = 68; // Set your desired thumbnail height
        const randomFileName = file.filename; // Use the random filename generated by Multer
        if (file.mimetype.startsWith("image/")) {
          const originalPath = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', randomFileName);
          const relativePath3 = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', 'thumbnails', randomFileName);
          const compressedPath = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', 'compressed', randomFileName);

          // Create and save the thumbnail
          await createThumbnail(file.path, relativePath3, thumbnailWidth, thumbnailHeight);
          await compressImages(file.path, compressedPath)
          await s3Service.uploadFile(relativePath3, `property-media/${req.PropertyID.toString()}/images/thumbnail-${randomFileName}`, file?.mimetype); // Thumbnail path to read file from our server and new path that needs to be created on s3 bucket
          await s3Service.uploadFile(compressedPath, `property-media/${req.PropertyID.toString()}/images/compressed-${randomFileName}`, file?.mimetype); // Compressed path to read file from our server and new path that needs to be created on s3 bucket
          await s3Service.uploadFile(originalPath, `property-media/${req.PropertyID.toString()}/images/original-${randomFileName}`, file?.mimetype)
          req.images.push({
            id: uuidv4(),
            url: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/images/compressed-${randomFileName}`,
            thumbnail: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/images/thumbnail-${randomFileName}`,
            compressed: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/images/compressed-${randomFileName}`,
            original: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/images/original-${randomFileName}`,
            original_name: file?.originalname ?? ""
          });
        } else if (file.mimetype.startsWith("video/")) {
          const video_path = `uploads/${req.PropertyID.toString()}/videos/${randomFileName}`
          s3Service.uploadFile(video_path, `property-media/${req.PropertyID.toString()}/videos/${randomFileName}`, file?.mimetype); // Video path to read file from our server and new path that needs to be created on s3 bucket
          req.videos.push({
            id: uuidv4(),
            url: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/videos/${randomFileName}`,
            original_name: file?.originalname
          });
        } else if (file.mimetype.startsWith("application/")) {
          const document_path = `uploads/${req.PropertyID.toString()}/documents/${randomFileName}`
          s3Service.uploadFile(document_path, `property-media/${req.PropertyID.toString()}/documents/${randomFileName}`, file?.mimetype); // Document path to read file from our server and new path that needs to be created on s3 bucket
          req.documents.push({
            id: uuidv4(),
            url: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/documents/${randomFileName}`,
            original_name: file?.originalname
          });
        }
      }
    }
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

router.delete("/property/:id", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), deleteProperty)

router.get("/property-managers", authorizer([UserRoles.LANDLORD]), getPropertyManagerList)

router.get("/property-manager/:id", authorizer([UserRoles.LANDLORD]), getPropertyManagerDetails)

router.get("/property-manager-property-lists/:id", authorizer([UserRoles.LANDLORD]), getPropertyListByPmID)

router.get("/terminate-property-manager/:id", authorizer([UserRoles.LANDLORD]), teminatePM)

router.put("/property/edit", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]),
  upload.any(),
  async (req, res) => {
    if (req?.files?.length > 0) {
      for await (let file of req.files) {
        const thumbnailWidth = 89; // Set your desired thumbnail width
        const thumbnailHeight = 68; // Set your desired thumbnail height
        const randomFileName = file.filename; // Use the random filename generated by Multer
        if (file.mimetype.startsWith("image/")) {
          const originalPath = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', randomFileName);
          const relativePath3 = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', 'thumbnails', randomFileName);
          const compressedPath = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', 'compressed', randomFileName);

          // Create and save the thumbnail
          await createThumbnail(file.path, relativePath3, thumbnailWidth, thumbnailHeight);
          await compressImages(file.path, compressedPath)
          await s3Service.uploadFile(relativePath3, `property-media/${req.PropertyID.toString()}/images/thumbnail-${randomFileName}`, file?.mimetype); // Thumbnail path to read file from our server and new path that needs to be created on s3 bucket
          await s3Service.uploadFile(compressedPath, `property-media/${req.PropertyID.toString()}/images/compressed-${randomFileName}`, file?.mimetype); // Compressed path to read file from our server and new path that needs to be created on s3 bucket
          await s3Service.uploadFile(originalPath, `property-media/${req.PropertyID.toString()}/images/original-${randomFileName}`, file?.mimetype)
          req.images.push({
            id: uuidv4(),
            url: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/images/compressed-${randomFileName}`,
            thumbnail: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/images/thumbnail-${randomFileName}`,
            compressed: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/images/compressed-${randomFileName}`,
            original: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/images/original-${randomFileName}`,
            original_name: file?.originalname ?? ""
          });
        } else if (file.mimetype.startsWith("video/")) {
          const video_path = `uploads/${req.PropertyID.toString()}/videos/${randomFileName}`
          s3Service.uploadFile(video_path, `property-media/${req.PropertyID.toString()}/videos/${randomFileName}`, file?.mimetype); // Video path to read file from our server and new path that needs to be created on s3 bucket
          req.videos.push({
            id: uuidv4(),
            url: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/videos/${randomFileName}`,
            original_name: file?.originalname
          });
        } else if (file.mimetype.startsWith("application/")) {
          const document_path = `uploads/${req.PropertyID.toString()}/documents/${randomFileName}`
          s3Service.uploadFile(document_path, `property-media/${req.PropertyID.toString()}/documents/${randomFileName}`, file?.mimetype); // Document path to read file from our server and new path that needs to be created on s3 bucket
          req.documents.push({
            id: uuidv4(),
            url: `${process.env.BUCKET_BASE_URL}/property-media/${req.PropertyID.toString()}/documents/${randomFileName}`,
            original_name: file?.originalname
          });
        }
      }
    }
    editProperty(req, res)
  },
)

router.get("/properties/dropdown", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), getAllPropertiesDropdown)

export default router;














