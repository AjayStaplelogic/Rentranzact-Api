import { sendResponse } from "../helpers/sendResponse.mjs";
import { payRentService , addToWallet} from "../services/stripe.service.mjs"

async function payRent(req, res) {
  const { body } = req;

  console.log(body , "====bdoduy")


  if (body.wallet) {

    console.log("came in walle t trueeeeeeeee e  e e e")

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
