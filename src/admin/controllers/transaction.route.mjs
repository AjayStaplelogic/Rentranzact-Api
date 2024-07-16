import { sendResponse } from "../helpers/sendResponse.mjs";
import { getTransactionService } from "../services/transaction.service.mjs";

async function getTransaction(req, res) {

    const data = await getTransactionService();
    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  }


export {  getTransaction };
