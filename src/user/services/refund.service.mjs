import Refunds from "../models/refunds.model.mjs";
import { ERefundfor } from "../enums/refunds.enum.mjs";
import { updateBillRefundStatus } from "./electricity.service.mjs";

export const updateRefundStatusFromWebhook = (gateway_type = null, event,) => {
    try {
        const { id, status } = event;
        refundStatusUpdate(id, gateway_type, status);
    } catch (error) {
    }
}

export const refundStatusUpdate = async (gateway_type, refund_id, status) => {
    try {
        Refunds.findOneAndUpdate(
            { refund_id, gateway_type, isDeleted: false },
            { status },
            { new: true }
        ).then((refund) => {
            switch (refund.type) {
                case ERefundfor.bill_payment:
                    // Update bill payment status
                    updateBillRefundStatus(refund);
                    break;
            }
        });
    }
    catch (error) {
        throw error;
    }
}