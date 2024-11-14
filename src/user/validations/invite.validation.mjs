import Joi from "joi";
export const inviteRenter = Joi.object().keys({
    email: Joi.string().email().required(),
    property_id: Joi.string().required(),
});
