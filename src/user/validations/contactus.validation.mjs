import Joi from "joi";

export const addContactRequest = Joi.object().keys({
        name: Joi.string().required().min(3).max(100),
        email: Joi.string().required().email(),
        phone: Joi.string().optional().allow(""),
        company: Joi.string().optional().allow(""),
        message: Joi.string().required(),
});
