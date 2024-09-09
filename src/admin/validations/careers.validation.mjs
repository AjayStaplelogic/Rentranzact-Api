import Joi from "joi";

export const addCareer = Joi.object().keys({
    title : Joi.string().lowercase().trim().required(),
    description : Joi.string().optional().allow(""),
    opening_count : Joi.number().optional().min(0),
    skills : Joi.string().optional().allow(""),
    experience : Joi.string().optional().allow(""),
});

export const editCareer = Joi.object().keys({
    id : Joi.string().required(),
    title : Joi.string().lowercase().trim().required(),
    description : Joi.string().optional().allow(""),
    opening_count : Joi.number().optional().min(0),
    skills : Joi.string().optional().allow(""),
    experience : Joi.string().optional().allow(""),
});

