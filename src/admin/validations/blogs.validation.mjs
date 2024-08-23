import Joi from "joi";

export const addBlog = Joi.object().keys({
    title : Joi.string().lowercase().trim().required(),
    content : Joi.string().optional().allow(""),
});

export const editBlog = Joi.object().keys({
    id : Joi.string().required(),
    title : Joi.string().lowercase().trim().required(),
    content : Joi.string().optional().allow(""),
});

