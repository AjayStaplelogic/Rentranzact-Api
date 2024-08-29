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

async function paystack(req,res) {

    const testSecretKey = "sk_test_853a8821768ec289d7692eaadf8e920edf7afb70";

    const testPublicKey = "pk_test_db9e3e625d89f39ace0be33b1550218e7603ed96";

    console.log(req.body ,"-------------webhook event")






}

export { stripe ,paystack };
