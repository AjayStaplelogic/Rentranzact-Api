import { sendResponse } from "../helpers/sendResponse.mjs";
import {payRentService} from "../services/stripe.service.mjs"

async function flutterwave(req, res) {
  const { body } = req;

 console.log(body, "=========body==============")

//   const data = await payRentService(body);

//   sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { flutterwave };
