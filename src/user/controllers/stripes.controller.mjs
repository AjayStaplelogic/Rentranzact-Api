import { sendResponse } from "../helpers/sendResponse.mjs";
import { Property } from "../models/property.model.mjs";
import { addStripeTransaction, rechargeWallet , addStripeTransactionForOld } from "../services/strips.service.mjs";
async function stripe(req, res) {

    const { body } = req;

    if (body.type === "payment_intent.succeeded") {

        const { wallet , renterApplicationID} = body.data.object.metadata;

        console.log(wallet , "===wallet value")

        if (wallet === "true") {

            const data = await rechargeWallet(body);

            sendResponse(res, data.data, data.message, data.status, data.statusCode);

           
        } else {

            const { propertyID } = body.data.object.metadata;

            const property = await Property.findById(propertyID);

            console.log("payment count ===>" ,property.payment_count)

            if(property.payment_count === 0) {

                const data = await addStripeTransaction(body , renterApplicationID);

                sendResponse(res, data.data, data.message, data.status, data.statusCode);
            } else {

                const data = await addStripeTransactionForOld(body , renterApplicationID);

                sendResponse(res, data.data, data.message, data.status, data.statusCode);

            }


            

            

          

        }

    }


}

export { stripe };
