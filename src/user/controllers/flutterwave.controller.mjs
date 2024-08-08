import { sendResponse } from "../helpers/sendResponse.mjs";
import { addFlutterwaveTransaction , addToWallet } from "../services/flutterwave.service.mjs";

async function flutterwave(req, res) {
  const { body } = req;

  const {wallet } = body;

  if(wallet) {

    const data = await addToWallet(body)



    sendResponse(res, data.data, data.message, data.status, data.statusCode);


  } else {

    const data = await addFlutterwaveTransaction(body)

    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  
  }
  

}

export { flutterwave };
