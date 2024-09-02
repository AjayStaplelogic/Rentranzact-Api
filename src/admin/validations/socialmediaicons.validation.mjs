import Joi from "joi";

export const addSocialMediaIcon = Joi.object().keys({
    title : Joi.string().required(),
    link : Joi.string().required().uri(),
});

export const editSocialMediaIcon = Joi.object().keys({
    id : Joi.string().required(),
    title : Joi.string().required(),
    link : Joi.string().required().uri(),
});

