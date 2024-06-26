import express from "express";
const router = express.Router();
import { addRentApplication , rentApplications } from "../controllers/rentApplication.controller.mjs";
import multer from "multer";
import { generateRandomFileName } from "../helpers/randomNameGenerator.mjs";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import path from "path";
import fs from "fs";
const baseUploadPath = "uploads/RentApplicationDocs";
const hostUrl = process.env.HOST_URL.replace(/^"(.*)"$/, "$1"); // Removes surrounding quotes

console.log(hostUrl, "=====host url ");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const imagesFolder = path.join(baseUploadPath, "images");

    if (!fs.existsSync(imagesFolder)) {
      fs.mkdirSync(imagesFolder, { recursive: true }); // Ensure folder and parent folders are created
    }

    // Determine subfolder based on file type (e.g., images or others)
    let destinationFolder = imagesFolder;
    if (!file.mimetype.startsWith("image/")) {
      // If not an image, handle accordingly (e.g., documents folder)
      destinationFolder = path.join(baseUploadPath, "documents");
      if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true });
      }
    }
    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    const randomFileName = generateRandomFileName(file);
    cb(null, randomFileName);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/rentApplication",
  authorizer([UserRoles.RENTER]),
  upload.single("image"),
  async (req, res) => {
    try {
      // Handle the uploaded file
      const uploadedFile = req.file;
      if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      // Here you can process the uploaded file, save the file details to database, etc.
      const fileUrl = `${hostUrl}ids/images/${req.file.filename}`;

      const renterID = req.user.data._id;

      // Example of calling controller function to handle further logic (saving to DB, etc.)
      const result = await addRentApplication(req.body, fileUrl, res, renterID); // Assuming addRentApplication is async and handles DB logic

      //   res.status(200).json({ message: "File uploaded successfully.", result });
    } catch (err) {
      console.error("Error uploading file:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);
router.get('/rentApplications', authorizer([UserRoles.RENTER , UserRoles.LANDLORD]) , rentApplications);


export default router;
