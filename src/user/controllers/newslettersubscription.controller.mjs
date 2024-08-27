import { sendResponse } from "../../user/helpers/sendResponse.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import NewsLetterSubscriptions from "../../admin/models/newlettersubscriptions.model.mjs";
import * as NewsLetterSubscriptionValidations from "../validations/newlettersubscription.validation.mjs"

export const subscribeNewLetter = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, NewsLetterSubscriptionValidations.subscribeNewLetter);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }
       req.body.email =  req.body.email.toLowerCase().trim();
        let query = {
            email: req.body.email
        }

        let is_exists = await NewsLetterSubscriptions.findOne(query).lean().exec();
        if(!is_exists) {
            let subscribe = await NewsLetterSubscriptions.create(req.body);
            if(subscribe) {
                return sendResponse(res, {}, "Subscribed successfully", true, 200);
            }
            return sendResponse(res, {}, "Failed to subscribe", false, 500);
        }
        return sendResponse(res, {}, "Already subscribed", false, 400);
    }catch (error) {
        return sendResponse(res, {}, `${error}`, false, 400);
    }
}