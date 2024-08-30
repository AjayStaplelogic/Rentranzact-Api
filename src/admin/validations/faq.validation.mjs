import Joi from "joi";
export const addFaq = Joi.object().keys({
    category : Joi.string().required().valid("general",  "service", "payment", "rent", "property", "refund"),
    question : Joi.string().required().min(3),
    answer : Joi.string().required().min(3),
});

export const editFaq = Joi.object().keys({
    id : Joi.string().required(),
    category : Joi.string().required().valid("general",  "service", "payment", "rent", "property", "refund"),
    question : Joi.string().required().min(3),
    answer : Joi.string().required().min(3),
});

