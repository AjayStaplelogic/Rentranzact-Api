import { sendResponse } from "../helpers/sendResponse.mjs";
import cyrpto from 'crypto'
async function idVerification(req, res) {

    

console.log("cameeeeee")
    console.log(req,"============req in signature")
    console.log(res, "============res in signature")

const secretKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE5MjgwMSwiZW52IjoibGl2ZSIsImlhdCI6MTY4MTgyODgyM30.jSGMGperQ9qiD9qjg4Gk3wQZ2LH5YwSSwRBD8MqmOoA"
    const signature = crypto.createHmac('sha512', secretKey).update(JSON.stringify(res.body)).digest('hex');
    if (signature === req.headers['x-verifyme-signatue']) {
        // Source of the webhook is verified , Add logic here

        console.log(res, "============res in signature")

    }


    sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { idVerification };
