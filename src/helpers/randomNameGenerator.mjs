import crypto from "crypto";
import path from "path";

function generateRandomFileName(file) {
  const randomName = crypto.randomBytes(20).toString("hex"); // Generate random hex string
  const fileExtension = path.extname(file.originalname); // Get file extension
  return `${randomName}${fileExtension}`;
}

export { generateRandomFileName };
