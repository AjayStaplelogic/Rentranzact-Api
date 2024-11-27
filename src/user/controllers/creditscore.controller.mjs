import CreditScores from "../models/creditscore.model.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as CreditScoreValidations from "../validations/creditscore.validation.mjs"
import { validator } from "../helpers/schema-validator.mjs";
import * as CreditScoreServices from "../services/creditscore.service.mjs";

export const addUpdateCreditScore = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, CreditScoreValidations.addUpdateCreditScore);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        const get_score = await CreditScoreServices.getCreditScore(req.body.bvn);
        if (get_score) {
            const update_score = await CreditScoreServices.addUpdateScore(req.user.data._id, get_score);
            if (update_score) {
                return sendResponse(res, null, "Credit Score fetched successfully", true, 200);
            }
            return sendResponse(res, null, "Unable to fetched credit score", false, 400);
        }

        return sendResponse(res, null, "Unable to fetched credit score", false, 400);
    } catch (error) {
        return sendResponse(res, null, `${error}`, false, 400)
    }
};

export const getCreditScore = async (req, res) => {
    try {
        const get_score = await CreditScores.findOne({
            user_id: req.user.data._id
        });

        return sendResponse(res, get_score, "Credit Score fetched successfully", true, 200);

    } catch (error) {
        return sendResponse(res, null, `${error}`, false, 400)
    }
};
