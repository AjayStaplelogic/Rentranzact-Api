import { sendResponse } from "../helpers/sendResponse.mjs";
import { adddummyTransactionService } from "../services/dummy.service.mjs";


async function adddummyTransaction(req, res) {
  const { body } = req;

  const data = await adddummyTransactionService(body)

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

export { adddummyTransaction };
