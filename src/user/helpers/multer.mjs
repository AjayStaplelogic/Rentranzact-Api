import multer from "multer";
import path from "path";
import fs from "fs";
import { generateRandomFileName } from "../helpers/randomNameGenerator.mjs";

const baseUploadPath = "uploads/";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(req)
        // console.log(JSON.stringify(req.body))

        // return

        let {folder} = req.body;
        console.log(folder, '====folder')
        folder = folder?? "images"
      const folderPath = path.join(baseUploadPath, folder);
      console.log(folderPath, '====folderPath')
  
      // Create the directories if they don't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath,  { recursive: true });
      }
    let destinationFolder = folderPath;

      cb(null, destinationFolder);
    },
  
    filename: function (req, file, cb) {
      const randomFileName = generateRandomFileName(file);
      console.log(randomFileName, '====randomFileName')
      cb(null, randomFileName);
    },
  });
  
export const upload = multer({ storage: storage });;