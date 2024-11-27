import Joi from "joi";
export const addUpdateCreditScore = Joi.object().keys({
    bvn: Joi.string().required()
});
