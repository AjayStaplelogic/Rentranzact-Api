import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { getMyTransaction } from "../services/transaction.service.mjs";

async function myTransaction(req, res) {
  const { body } = req;


  const userID = req.user.data._id;

  const role = req.user.data.role;



  const data = await getMyTransaction(userID, role);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { myTransaction };
