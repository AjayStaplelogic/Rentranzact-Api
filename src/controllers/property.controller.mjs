import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addPropertyService } from "../services/property.service.mjs";


async function addProperty(req, res) {
  const { body } = req;

  const data = await addPropertyService(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { addProperty };
