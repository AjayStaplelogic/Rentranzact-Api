import { sendResponse } from "../helpers/sendResponse.mjs";
import { payViaGlobalPayService } from "../services/globalPay.service.mjs";
import * as cryptoServices from "../../helpers/crypto.mjs";

export const payViaGlobalPay = async (req, res) => {
    try {
        const payload = req.body;
        if (payload?.amount > 0) {
            const userData = req.user.data;
            const result = await payViaGlobalPayService(payload, userData);
            const resObj = {
                url: cryptoServices.encryptionForFrontend(result?.data?.checkoutUrl)
            }

            return sendResponse(res, resObj, "Success", true, 200);
        } else {
            return sendResponse(res, null, "Amount should be greater than 0", false, 400);
        }
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}


export const globalPayWebhook = async (req, res) => {
    try {
        const { body } = req;
        console.log(body, '====================body 1111111111')
        console.log(JSON.stringify(body), '====================JSON.stringify(body) 1111111111')

        return res.status(200).end();
    } catch (error) {
        console.log(error, '======== error In Flutterwave webhook')
    }
}