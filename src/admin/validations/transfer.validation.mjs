import Joi from "joi";
import { ETRANSFER_STATUS } from "../../user/enums/transfer.enums.mjs"

export const updateTransferStatus = Joi.object().keys({
    id: Joi.string().required(),
    status: Joi.string().required().valid(ETRANSFER_STATUS.rejected, ETRANSFER_STATUS.transferred),
    description: Joi.string().optional().allow(""),
});

export const updateApprovalStatus = Joi.object().keys({
    id: Joi.string().required(),
    status: Joi.string().required().valid(ETRANSFER_STATUS.approvedByEmp, ETRANSFER_STATUS.rejectedByEmp),
    description: Joi.string().optional().allow(""),
});

