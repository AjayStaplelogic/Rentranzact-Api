import Payouts from "../models/payouts.model.mjs";

export const updateStatusFromWebhook = async (event) => {
    //Note : We are not reversing amount to wallet because if balance is reversed to account
    // Then balance_available webhook will be automatically fired and updates wallet points code
    // already added there 
    const data = event?.data?.object;
    if (data) {
        const payload = {
            status: data?.status,
        }

        if (data.failure_code) {
            payload.failure_code = data?.failure_code ?? "";
        }

        if (data.failure_message) {
            payload.failure_message = data?.failure_message ?? "";
        }

        Payouts.findOneAndUpdate({ payout_id: data?.id }, payload, { new: true })
    }
}