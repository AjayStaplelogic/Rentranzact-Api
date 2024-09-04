import Joi from "joi";

export const addBanner = Joi.object().keys({
    title : Joi.string().lowercase().trim().required(),
    content : Joi.string().optional().allow(""),
});

export const editBanner = Joi.object().keys({
    id : Joi.string().required(),
    title : Joi.string().lowercase().trim().required(),
    content : Joi.string().optional().allow(""),
});

