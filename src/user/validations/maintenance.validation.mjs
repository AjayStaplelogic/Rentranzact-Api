import Joi from "joi";
export const addMaintenanceRequests = Joi.object().keys({
    concern: Joi.string().required(),
    propertyID: Joi.string().required(),
    renterRemark: Joi.string().required().min(3).max(1000)
});

export const addRemarkToRequest = Joi.object().keys({
    maintenanceID: Joi.string().required(),
    landlordRemark: Joi.string().required().min(3).max(1000)
});
