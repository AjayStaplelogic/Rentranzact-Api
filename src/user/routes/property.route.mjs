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
import fsAsync from 'fs/promises';
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
    const compressedFolder = path.join(propertyFolder, "images", "compressed")


  
    // Create the directories if they don't exist
    if (!fs.existsSync(propertyFolder)) {                  // commented this code to avoid checking before demo call
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
  (req, res) => {

    console.log(`[Inside upload]`);
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
        req.documents.push({ id: uuidv4(), url: relativePath, original_name :  file.originalname });
      }

      console.log(`[File Uploaded Count] : [${count}]`)
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


      // console.log(file, '=======file111')
      // console.log(file.mimetype.startsWith("image/"), '=======file.mimetype.startsWith("image/")111')

      if (file.mimetype.startsWith("image/")) {
        // console.log("Changes file memetppe")

        const relativePath2 = path.join(hostUrl, "property", req.PropertyID.toString(), "images", "thumbnails", randomFileName)
        const relativePath3 = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', 'thumbnails', randomFileName);
        const compressedPath = path.resolve(__dirname, '..', '..', '..', 'uploads', req.PropertyID.toString(), 'images', 'compressed', randomFileName);
        const compressedPathDisplay = path.join(hostUrl, "property", req.PropertyID.toString(), "images", "compressed", randomFileName)

        req.images.push({
          id: uuidv4(),
          // url: relativePath,
          url: compressedPathDisplay,
          thumbnail: relativePath2,
          compressed: compressedPathDisplay
        });
        // console.log(req.images, '=======req.images111')

        // Create and save the thumbnail
        await createThumbnail(file.path, relativePath3, thumbnailWidth, thumbnailHeight);
        await compressImages(file.path, compressedPath)
      } else if (file.mimetype.startsWith("video/")) {
        req.videos.push({ id: uuidv4(), url: relativePath });
      } else if (file.mimetype.startsWith("application/")) {
        req.documents.push({ id: uuidv4(), url: relativePath, original_name :  file.originalname });
      }

    });
    editProperty(req, res)
  },
)

router.get("/properties/dropdown", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), getAllPropertiesDropdown)

// console.log(path.resolve(__dirname, '../../../uploads'))
const sourceFolder = path.resolve(__dirname, '../../../uploads');
const compressedFolder = path.resolve(__dirname, '../../../property_compressed');

// import sharp from 'sharp';
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

async function createFolderIfNotExists(folderPath) {
  try {
    await fsAsync.mkdir(folderPath, { recursive: true });
    console.log(`Directory created or already exists: ${folderPath}`);
  } catch (err) {
    console.error(`Error creating directory: ${err.message}`);
  }
}


async function compressImagesInFolder() {
  try {
    console.log("COmpressed function")
    // Ensure the compressed folder exists
    await createFolderIfNotExists(compressedFolder);
    // Initialize counters
    let successCount = 0;
    let skippedCount = 0;

    // Get all files from the source folder
    fs.readdir(sourceFolder, async (err, files) => {
      if (files && files.length > 0) {
        console.log('Files found:', files);


        // Loop through each file
        for (const file of files) {
          console.log(path.extname(file).toLowerCase(), '=path.extname(file).toLowerCase()1111')
          if (![".jpg", ".jpeg", ".png", ".pdf", ".avif"].includes(path.extname(file).toLowerCase())) {
            console.log("Entered")


            await createFolderIfNotExists(`${compressedFolder}/${file}`)
            fs.readdir(path.join(sourceFolder, file), async (err, dirFiles) => {
              // console.log(dirFiles, '===dirFiles')

              if (dirFiles && dirFiles.length > 0) {
                // console.log("Entered in last DIrecotries")
                for await (let lastFile of dirFiles) {
                  console.log(path.extname(lastFile).toLowerCase(), '=path.extname(lastFile).toLowerCase()1111')
                  if (![".jpg", ".jpeg", ".png", ".pdf", ".avif"].includes(path.extname(lastFile).toLowerCase())) {
                    console.log("Entered")
                    await createFolderIfNotExists(`${compressedFolder}/${file}/${lastFile}`);
                    fs.readdir(path.join(sourceFolder, file, lastFile), async (err, endFiles) => {
                      // console.log(endFiles, '====endFiles')
                      if (endFiles && endFiles.length > 0) {
                        for await (let endLastFile of endFiles) {
                          const filePath = path.join(sourceFolder, file, lastFile, endLastFile);
                          // console.log(filePath, '====filePathllll')

                          // Check if it's an image file (jpg/jpeg)
                          const compressedFilePath = path.join(compressedFolder, file, lastFile, endLastFile); // Same file name in compressed folder
                          if (path.extname(endLastFile).toLowerCase() === '.jpg' || path.extname(endLastFile).toLowerCase() === '.jpeg') {

                            // console.log(compressedFilePath, '====compressedFilePath')

                            try {
                              // Compress and save the image
                              await sharp(filePath)
                                .jpeg({ quality: 40 }) // Set the quality to 40 (adjust as needed)
                                .toFile(compressedFilePath);

                              console.log(`Compressed and saved: ${file}`);
                              successCount++; // Increment success count
                            } catch (compressError) {
                              console.error(`Error compressing ${file}:`, compressError.message);
                              // If there is an error, copy the original file to the compressed folder

                              fs.copyFile(filePath, compressedFilePath, (err, file) => {
                                console.log(`Original file copied to compressed folder: ${file}`);
                                skippedCount++; // Increment skipped count
                              });
                            }
                          } else {
                            fs.copyFile(filePath, compressedFilePath, (err, file) => {
                              console.log(`Original file copied to compressed folder: ${file}`);
                              skippedCount++; // Increment skipped count
                            });

                          }
                        }
                      }
                    })
                  } else {
                    const filePath = path.join(sourceFolder, file, lastFile);
                    console.log(filePath, '====filePathllll')

                    // Check if it's an image file (jpg/jpeg)
                    const compressedFilePath = path.join(compressedFolder, file, lastFile); // Same file name in compressed folder
                    fs.copyFile(filePath, compressedFilePath, (err, file) => {
                      console.log(`Original file copied to compressed folder: ${file}`);
                      skippedCount++; // Increment skipped count
                    });
                  }
                }
              }
            });
          } else {
            const filePath = path.join(sourceFolder, file);
            console.log(filePath, '====filePathllll')

            // Check if it's an image file (jpg/jpeg)
            const compressedFilePath = path.join(compressedFolder, file); // Same file name in compressed folder
            await fs.copyFile(filePath, compressedFilePath, (err, file) => {
              console.log(`Original file copied to compressed folder: ${file}`);
              skippedCount++; // Increment skipped count
            });
          }
        }
      }
    });


    // Log the final counts
    console.log(`All images have been processed. \nSuccessfully compressed: ${successCount} \nSkipped (due to errors): ${skippedCount}`);
  } catch (error) {
    console.error('Error reading directory or processing images:', error);
  }
}



// try {
//   compressImagesInFolder()
// } catch (error) {

// }
export default router;














