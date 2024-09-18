import ContactUs from "../models/contactus.model.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as ContactUsValidations from "../validations/contactus.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";

export const addContactRequest = async (req, res) => {
    try {
        console.log(`[Add Carrier]`)
        const { isError, errors } = validator(req.body, ContactUsValidations.addContactRequest);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        let add_request = await ContactUs.create(req.body);
        if (add_request) {
            return sendResponse(res, add_request, "Request sent successfully", true, 200);
        }
        return sendResponse(res, {}, "Server Error", false, 500);
    } catch (error) {
        console.log(error)
        return sendResponse(res, {}, `${error}`, false, 400);

    }
}
