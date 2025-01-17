import fs from 'fs'
import multer from 'multer';
import path from "path"

const baseUploadPath = "uploads/";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const documentDir = path.join(baseUploadPath, "icons");
        if (!fs.existsSync(documentDir)) {
            fs.mkdirSync(documentDir);
        }
        let destinationFolder = documentDir;

        cb(null, destinationFolder);
    },

    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // Get the file extension
        const extract_original_name = file?.originalname?.split(".")[0];
        const randomFileName = `${extract_original_name ? extract_original_name : "random"}-${new Date().getTime()}${ext}`;
        cb(null, randomFileName);
    },
});

export const upload = multer({ storage: storage });;

export const deleteMedia = async (media)=>{
    try {
        let filePath = `uploads/icons/${media}`
        fs.unlinkSync(filePath)
    } catch (error) {
    }
}
