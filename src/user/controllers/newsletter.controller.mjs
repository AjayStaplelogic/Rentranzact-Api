import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";

async function newsletter(req, res) {
  const { body } = req;

  const data = await subscribeNewsletter(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { newsletter };
