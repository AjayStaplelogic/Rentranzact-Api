import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addMaintenanceRequests } from "../services/maintenance.service.mjs";

async function addMaintenance(req, res) {
  const { body } = req;

  const id = req.user.data._id;

  body.renterID = id;

  const data = await addMaintenanceRequests(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { addMaintenance };
