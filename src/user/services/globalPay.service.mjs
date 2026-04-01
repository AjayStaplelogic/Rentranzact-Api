import axios from "axios";
import moment from "moment";
import { ETRANSACTION_LANDLORD_PAYMENT_STATUS, ETRANSACTION_PM_PAYMENT_STATUS, ETRANSACTION_TYPE } from "../enums/common.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { EPaymentType } from "../enums/wallet.enum.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import { User } from "../models/user.model.mjs";
import { Wallet } from "../models/wallet.model.mjs";
import * as TransferServices from "../services/transfer.service.mjs";


export const payViaGlobalPayService = async (payload, userData) => {
    try {
        const url = 'https://paygw.globalpay.com.ng/globalpay-paymentgateway/api/paymentgateway/generate-payment-link';

        const meta_data_arr = Object.entries(payload.meta_data).map(([key, value]) => ({
            name: key,
            value: value
        }));

        const data = {
            amount: payload.amount,
            merchantTransactionReference: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            redirectUrl: payload.is_mobile === true ? `` : `${process.env.FRONTEND_URL}`,
            customer: {
                lastName: "na",
                firstName: userData?.fullName,
                currency: "NGN",
                phoneNumber: userData?.phone ?? "",
                address: "",
                emailAddress: userData?.email,
                paymentFormCustomFields: meta_data_arr
            }
        };

        try {
            const response = await axios.post(url, data, {
                headers: {
                    apiKey: process.env.GLOBAL_PAY_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response:', response.data);
            return response.data;

        } catch (error) {
            console.error(
                'Error:',
                error.response ? error.response.data : error.message
            );
            throw error;
        }

    } catch (error) {
        throw error;
    }
};


export const addToWallet = (data, meta_data) => {
    try {
        console.log('**********Add To Wallet Functio n***********')
        let { finalAmount, status, PaymentDate, TransactionReference } = data;
        let { userID } = meta_data;
        const created = moment(PaymentDate).unix();
        const amount = finalAmount
        const id = TransactionReference;
        if (status?.toLowerCase() === "successful") {
            User.findById(userID).then(async (userDetail) => {
                if (userDetail) {
                    const transfer = await TransferServices.transferForWalletRecharge(
                        userDetail._id,
                        "USD",
                        "NGN",
                        amount
                    )
                    console.log(transfer, '==========transfer')
                    if (transfer) {
                        let payload = {
                            amount,
                            status,
                            createdAt: created,
                            type: "CREDIT",
                            userID,
                            intentID: id,
                            payment_type: EPaymentType.rechargeWallet
                        }

                        let add_wallet = await Wallet.create(payload);
                        if (add_wallet) {
                            let transaction_payload = {
                                wallet: true,
                                amount: amount,
                                status: status,
                                date: created,
                                intentID: id,
                                type: "CREDIT",
                                payment_mode: "flutterwave",
                                transaction_type: ETRANSACTION_TYPE.rechargeWallet,
                                receiver_id: userDetail._id,
                                landlord_payment_status: ETRANSACTION_LANDLORD_PAYMENT_STATUS.paid,
                                pm_payment_status: ETRANSACTION_PM_PAYMENT_STATUS.paid,
                            };

                            if (userDetail.role === UserRoles.LANDLORD) {
                                transaction_payload.landlordID = userDetail._id;
                            } else if (userDetail.role === UserRoles.RENTER) {
                                transaction_payload.renterID = userDetail._id;
                            } else if (userDetail.role === UserRoles.PROPERTY_MANAGER) {
                                transaction_payload.pmID = userDetail._id;
                            }

                            let create_transaction = await Transaction.create(transaction_payload);
                        }
                    }
                }
            });
        }
    } catch (error) {
    }
}