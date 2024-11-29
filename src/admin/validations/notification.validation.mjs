import Joi from "joi";
export const readUnreadNotification = Joi.object().keys({
    id: Joi.string().required(),
    read: Joi.boolean().required(),
});


export const manualCreateNotification = Joi.object().keys({
    notificationHeading: Joi.string().required(),
    notificationBody: Joi.string().required(),
    roles: Joi.array().items(Joi.string().required()).required(),
});
