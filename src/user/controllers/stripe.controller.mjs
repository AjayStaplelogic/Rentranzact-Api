import { sendResponse } from "../helpers/sendResponse.mjs";
import { payRentService } from "../services/stripe.service.mjs"

async function payRent(req, res) {
  const { body } = req;


  if (body.wallet) {

    const userID = req.user.data._id;
    const data = await addToWallet(body, userID);
    sendResponse(res, data.data, data.message, data.status, data.statusCode);


  } else {
    const userID = req.user.data._id;
    const data = await payRentService(body, userID);
    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  }






}

export { payRent };
