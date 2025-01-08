import Joi from "joi";

export const editProfile = Joi.object().keys({
    id: Joi.string().required(),
    fullName: Joi.string().optional(),
    countryCode: Joi.string().optional().allow(""),
    phone: Joi.string().optional().allow(""),
    picture: Joi.string().optional().allow(""),
    gender: Joi.string().optional().allow("male", "female"),
});

export const changePassword = Joi.object().keys({
    id: Joi.string().required(),
    old_password: Joi.string().required(),
    new_password: Joi.string().required(),
    confirm_password: Joi.string().optional().allow(""),
});