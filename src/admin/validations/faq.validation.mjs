import Joi from "joi";
import { CATEGORIES } from "../enums/faq.enums.mjs";
export const addFaq = Joi.object().keys({
    category : Joi.string().required().valid(...Object.values(CATEGORIES)),
    question : Joi.string().required().min(3),
    answer : Joi.string().required().min(3),
});

export const editFaq = Joi.object().keys({
    id : Joi.string().required(),
    category : Joi.string().required().valid(...Object.values(CATEGORIES)),
    question : Joi.string().required().min(3),
    answer : Joi.string().required().min(3),
});

