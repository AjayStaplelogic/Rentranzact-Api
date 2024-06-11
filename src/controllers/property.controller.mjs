import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addPropertyService } from "../services/property.service.mjs";


async function addProperty(req, res) {
  const { body } = req;

  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  const images = files.filter(file => file.mimetype.startsWith('image/'));
  const documents = files.filter(file => file.mimetype === 'application/pdf');

  if (images.length > 0) {
    console.log('Images uploaded:');
    images.forEach(image => {
      console.log(image.originalname);
    });
  }

  if (documents.length > 0) {
    console.log('Documents uploaded:');
    documents.forEach(document => {
      console.log(document.originalname);
    });
  }

  const data = await addPropertyService(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { addProperty };
