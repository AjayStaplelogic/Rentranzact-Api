import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { getMyTransaction , transactionByIdService} from "../services/transaction.service.mjs";

async function myTransaction(req, res) {
  const { body } = req;


  const userID = req.user.data._id;

  const role = req.user.data.role;



  const data = await getMyTransaction(userID, role);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function transactionById(req, res) { 

  const {id} = req.params;

  const data = await transactionByIdService(userID, role);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}


export { myTransaction , transactionById };
