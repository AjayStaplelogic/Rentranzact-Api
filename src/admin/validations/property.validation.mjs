import Joi from "joi";
import { ApprovalStatus } from "../../user/enums/property.enums.mjs"

export const updatePropertyApprovalStatus = Joi.object().keys({
    id: Joi.string().required(),
    status: Joi.string().required().valid(ApprovalStatus.APPROVED, ApprovalStatus.REJECTED),
    current_user_id: Joi.string().optional().allow("", null)
});