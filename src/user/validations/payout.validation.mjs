import Joi from "joi";

export const createPayout = Joi.object().keys({
    amount: Joi.number().required().min(1),
    description : Joi.string().optional().allow("")
});
