import Joi from "joi";
import { BANNER_PAGES_ENUMS } from "../enums/banner.enums.mjs";

export const addBanner = Joi.object().keys({
  page: Joi.string()
    .trim()
    .required()
    .valid(...Object.values(BANNER_PAGES_ENUMS)),
  title: Joi.string().lowercase().trim().required(),
  content: Joi.string().optional().allow(""),
});

export const editBanner = Joi.object().keys({
  page: Joi.string()
    .trim()
    .required()
    .valid(...Object.values(BANNER_PAGES_ENUMS)),
  id: Joi.string().required(),
  title: Joi.string().lowercase().trim().required(),
  content: Joi.string().optional().allow(""),
});
