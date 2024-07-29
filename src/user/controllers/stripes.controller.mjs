import { sendResponse } from "../helpers/sendResponse.mjs";
import { addStripeTransaction, rechargeWallet } from "../services/strips.service.mjs";
async function stripe(req, res) {

    const { body } = req;

    if (body.type === "payment_intent.succeeded") {

        const { wallet } = body.data.object.metadata;

        if (wallet) {


            const data = await addStripeTransaction(body);

            sendResponse(res, data.data, data.message, data.status, data.statusCode);
        } else {



            const data = await rechargeWallet(body);

            sendResponse(res, data.data, data.message, data.status, data.statusCode);

        }

    }


}

export { stripe };
