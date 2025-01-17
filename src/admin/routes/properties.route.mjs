import express from 'express'
const router = express.Router();
import {
    properties,
    property,
    deleteProperty,
    leaseAggrements,
    updateProperty,
    getAllPropertyList,
    editProperty,
    updatePropertyApprovalStatus,
    deleteAggrementByID,
    addProperty
} from "../controllers/properties.controller.mjs"
import { generateRandomFileName } from "../../user/helpers/randomNameGenerator.mjs";
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

router.get('/properties', properties)
router.get('/property/:id', property)
router.delete('/property/:id', deleteProperty)
router.get("/lease-agreements", leaseAggrements)
router.put("/property", updateProperty);
router.get("/properties/all", getAllPropertyList)
router.put("/property/edit",
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
                req.documents.push({ id: uuidv4(), url: relativePath, original_name: file.originalname });
            }

        });
        editProperty(req, res)
    },
)

router.put("/property/approval-status", updatePropertyApprovalStatus);
router.delete("/lease-aggerment/:id", deleteAggrementByID)

router.post(
    "/property",
    upload.any(),
    (req, res) => {
        let count = 0;
        req.files.forEach(async (file) => {
            count++;
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
                const compressedPath = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', 'compressed', randomFileName);
                const compressedPathDisplay = path.join(hostUrl, "property", req.PropertyID.toString(), "images", "compressed", randomFileName)

                req.images.push({
                    id: uuidv4(),
                    //  url: relativePath, 
                    url: compressedPathDisplay,
                    thumbnail: relativePath2,
                    compressed: compressedPathDisplay
                });

                // Create and save the thumbnail
                createThumbnail(file.path, relativePath3, thumbnailWidth, thumbnailHeight);
                await compressImages(file.path, compressedPath)
            } else if (file.mimetype.startsWith("video/")) {
                req.videos.push({ id: uuidv4(), url: relativePath });
            } else if (file.mimetype.startsWith("application/")) {
                req.documents.push({ id: uuidv4(), url: relativePath, original_name: file.originalname });
            }
        });
        addProperty(req, res);
    }
);



export default router;

