import { sendResponse } from "../helpers/sendResponse.mjs";
import verifyMeter from "../helpers/verifyMeter.mjs";

export const payBill = async (req, res) => {
    try {

        const sandboxUrl = "https://sandbox.vtpass.com/api/pay";

        const {meterID, meterType, serviceID} = req.body;

        const isMeterValid = await verifyMeter(meterID, meterType, serviceID);

        if(!isMeterValid) {
            return sendResponse(res, {}, "your meter is not valid", false, 400);
        } 

        const payload = {
            "billersCode": meterID,
            "type": meterType,
            "serviceID": serviceID
        }

        const headers = {
            "api-key": sandboxApiKey,
            "secret-key": sandboxSecretKey
        }

        const data = await axios.post(sandboxUrl, payload, { headers });

        consolel

              
      //  return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}