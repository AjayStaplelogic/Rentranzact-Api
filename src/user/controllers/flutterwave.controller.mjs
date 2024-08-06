import { sendResponse } from "../helpers/sendResponse.mjs";
import { addFlutterwaveTransaction } from "../services/flutterwave.service.mjs";

async function flutterwave(req, res) {
  const { body } = req;
  
  console.log(req.body, "=========boddyyyy")

 const data = await addFlutterwaveTransaction(body)

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

export { flutterwave };
