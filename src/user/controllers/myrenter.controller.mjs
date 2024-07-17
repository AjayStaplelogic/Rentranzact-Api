import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { myRentersService } from "../services/myrenter.service.mjs";

async function myRenters(req, res) {
  const { _id } = req.user.data;

  const data = await myRentersService(_id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { myRenters };
