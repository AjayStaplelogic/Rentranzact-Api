import ConnectedAccounts from "../models/connectedAccounts.model.mjs";
import Payouts from "../models/payouts.model.mjs";
import * as WalletServices from "../services/wallet.service.mjs";

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

        Payouts.findOneAndUpdate({ payout_id: data?.id }, payload, { new: true }).then((updatePayout) => {
            if (updatePayout?.account_id) {
                ConnectedAccounts.findOne({
                    _id: updatePayout.account_id,
                    user_id: updatePayout.user_id,
                    isDeleted: false
                },
                    {
                        user_id: 1,
                        connect_acc_id: 1
                    }).then(account => {
                        if (account?.user_id && account?.connect_acc_id) {
                            WalletServices.fetchBalanceAndUpdateWalletPoints(account.user_id, account?.connect_acc_id)
                        }
                    });
            }
        })
    }
}