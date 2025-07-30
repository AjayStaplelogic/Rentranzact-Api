import Joi from "joi";

export const teriminatePM = Joi.object().keys({
    property_id: Joi.string().required(),
    property_manager_id: Joi.string().required(),
    reason: Joi.string().optional().allow("")
});


export const updateRentDueDate = Joi.object().keys({
    property_id: Joi.string().required(),
    rent_period_due: Joi.date().required(),
});
