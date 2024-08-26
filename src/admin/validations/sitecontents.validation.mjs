import Joi from "joi";

export const addUpdateSiteContent = Joi.object().keys({
    slug : Joi.string().required().valid("about-us", "privacy-policy", "data-protection"),
    title : Joi.string().optional().allow(""),
    content : Joi.string().optional().allow(""),
});
