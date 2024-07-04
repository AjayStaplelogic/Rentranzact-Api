import { sendResponse } from "../helpers/sendResponse.mjs";
import { addStripeTransaction } from "../services/strips.service.mjs";
async function stripe(req, res) {

    console.log(body, "=========boddddyyyyy")
    const { body } = req;

    const data = await addStripeTransaction(body);

    sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { stripe };
