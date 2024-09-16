import multer from "multer";
import path from "path";
import fs from "fs";
import { generateRandomFileName } from "../helpers/randomNameGenerator.mjs";
const baseUploadPath = "uploads/";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let { folder } = req.body;
    folder = folder ?? "images"
    const folderPath = path.join(baseUploadPath, folder);

    // Create the directories if they don't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    let destinationFolder = folderPath;

    cb(null, destinationFolder);
  },

  filename: function (req, file, cb) {
    const randomFileName = generateRandomFileName(file);
    cb(null, randomFileName);
  },
});

export const upload = multer({ storage: storage });;


const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    let { folder } = req.body;
    folder = folder ?? "images"
    const folderPath = path.join(baseUploadPath, folder);

    // Create the directories if they don't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    let destinationFolder = folderPath;
    cb(null, destinationFolder);
  },

  filename: function (req, file, cb) {
    const randomFileName = generateRandomFileName(file);
    cb(null, randomFileName);
  },

});

export const upload2 = multer({
  storage: storage2
});;