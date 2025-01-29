import Joi from "joi";
import { ERenterType } from "../enums/invite.enum.mjs";
export const inviteRenter = Joi.object().keys({
    email: Joi.string().email().required(),
    property_id: Joi.string().required(),
    renter_type: Joi.string().required().valid(...Object.values(ERenterType)),
    rent_expiration_date: Joi.date().optional().allow("", null)
});
