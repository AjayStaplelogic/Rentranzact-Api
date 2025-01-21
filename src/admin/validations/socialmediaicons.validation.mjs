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


export const addUpdateSocialMediaIcons = Joi.object().keys({
    slug : Joi.string().required().valid("instagram", "facebook", "twitter", "linkedin"),
    title : Joi.string().optional().allow(""),
    link : Joi.string().required().uri(),
});
