import Joi from "joi";

export const teriminatePM = Joi.object().keys({
    property_id: Joi.string().required(),
    property_manager_id: Joi.string().required(),
    reason: Joi.string().optional().allow("")
});
