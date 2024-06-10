import { addInWalletService } from "../services/wallet.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";

async function addInWallet(req, res) {
  const { body } = req;

  const data = await addInWalletService(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { addInWallet };
