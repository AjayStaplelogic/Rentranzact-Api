import multer from "multer";
import path from "path";
import fs from "fs";
import { generateRandomFileName } from "../helpers/randomNameGenerator.mjs";
const baseUploadPath = "uploads/";
import { MEDIA_TYPES_REGEXP } from "../enums/common.mjs";

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

export const upload = multer({ storage: storage });

// New dynamic storage
export const fileFilterFun = (req, file, cb) => {
  let { mediaType } = req.body;

  let filetypes = MEDIA_TYPES_REGEXP[mediaType?.toUpperCase()]; // fetching regex pattern A.T. media type requested
  if (!filetypes) {
    return cb(new Error('Invalid file type'))
  }

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true)
  }

  return cb(new Error('Invalid file type'))
}

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    let { folder, mediaType } = req.body;
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
  storage: storage2,
  fileFilter: (req, file, cb) => {
    fileFilterFun(req, file, cb)
  }
});

