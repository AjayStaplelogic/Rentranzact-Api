import Joi from "joi";
export const readUnreadNotification = Joi.object().keys({
    id : Joi.string().required(),
    read : Joi.boolean().required(),
});
