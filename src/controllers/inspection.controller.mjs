import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { createInspection } from "../services/inspection.service.mjs";
async function addInspection(req, res) {
  const { body } = req;

  const data = await createInspection(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { addInspection };
