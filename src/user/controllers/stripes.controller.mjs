import { sendResponse } from "../helpers/sendResponse.mjs";
import { addStripeTransaction, rechargeWallet } from "../services/strips.service.mjs";
async function stripe(req, res) {

    const { body } = req;

    if (body.type === "payment_intent.succeeded") {

        const { wallet , renterApplicationID} = body.data.object.metadata;


        console.log(body.data.object.metadata , "=============meta data ")

        console.log(typeof wallet , "-----wallet ")

        if (wallet === "true") {

            const data = await rechargeWallet(body);

            sendResponse(res, data.data, data.message, data.status, data.statusCode);

           
        } else {

            const data = await addStripeTransaction(body , renterApplicationID);

            sendResponse(res, data.data, data.message, data.status, data.statusCode);

          

        }

    }


}

export { stripe };
