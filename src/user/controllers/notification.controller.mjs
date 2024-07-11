import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { getNotificationService } from "../services/notification.service.mjs";

async function getNotification(req, res) {

  console.log(req.user, "-----user")

  const userID = req.user.data._id;

  const data = await getNotificationService(userID);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { getNotification };
