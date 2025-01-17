import axios from "axios";

const Live = "https://api-service.vtpass.com/api/merchant-verify";
const Sandbox = "https://sandbox.vtpass.com/api/merchant-verify";
const sandboxApiKey = "b00050193a731227682797b5568d7bb9";
const sandboxSecretKey = "SK_5946c7d4f1fba6642df43745afad1034feca7c1009a";
const sandboxPublicKey = "PK_2511f99f266b279e7c71002e2035944e1ab9690ff27"


async function verifyMeter(meterID, meterType, serviceID) {

    try {
        const payload = {
            "billersCode": meterID,
            "type": meterType,
            "serviceID": serviceID
        }

        const headers = {
            "api-key": sandboxApiKey,
            "secret-key": sandboxSecretKey
        }

        const data = await axios.post(Sandbox, payload, { headers });

        if (data.data && data.data.code === '000' && data.data.content) {

            return true;
        } else {
            false
        }

    } catch (error) {
        return false;
    }
    
}

export default verifyMeter;