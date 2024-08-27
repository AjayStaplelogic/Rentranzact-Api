import Joi from "joi";
import { UserRoles } from "../../user/enums/role.enums.mjs"

export const addTestimonial = Joi.object().keys({
    name : Joi.string().lowercase().trim().required(),
    role : Joi.string().required().valid(UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER),
    description : Joi.string().optional().allow(""),
});

export const editTestimonial = Joi.object().keys({
    id : Joi.string().required(),
    name : Joi.string().lowercase().trim().required(),
    role : Joi.string().required().valid(UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER),
    description : Joi.string().optional().allow(""),
});

