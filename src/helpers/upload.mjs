import multer from 'multer';
import path from 'path';

// Define the storage engine for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get the property ID from the request object
    const propertyId = req.propertyID; // Assuming propertyId is set on the request object after property creation
    // Define the destination directory based on the property ID
    const destinationDir = path.join(__dirname, '..', 'uploads', propertyId.toString());
    cb(null, destinationDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original filename
  }
});

// Create a multer instance with the defined storage engine
const upload = multer({ storage: storage });

export { upload };
