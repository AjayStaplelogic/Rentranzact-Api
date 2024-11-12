import Transfers from "../models/transfers.model.mjs";
import { ETRANSFER_TYPE } from "../enums/transfer.enums.mjs";
import { Property } from "../models/property.model.mjs";
import * as AccountServices from "../services/account.service.mjs";
import * as CommonHelpers from "../helpers/common.helper.mjs";
import * as StripeCommonServices from "../services/stripecommon.service.mjs";
import { User } from "../models/user.model.mjs";

export const makeTransferForPropertyRent = async (property_data = null, property_id = null, amount = 0) => {
    if (!property_data) {       // If property data is not provided then fetching it will property_id
        if (!property_id) {     // If property id is also not provided then returned false
            return false;
        }

        property_data = await Property.findById(property_id);
        if (!property_data) {       // If property not found in db then returning false
            return false;
        }
    }

    if (amount > 0) {
        const transfer_payload = {
            transfer_type: ETRANSFER_TYPE.rentPayment,
            is_from_admin: true,
            to: property_data?.landlord_id,
            property_id: property_data._id,
            amount: amount,
            from_currency: "USD",
            to_currency: "NGN",
            property_name: property_data?.propertyName ?? "",
            property_address: property_data?.address?.addressText ?? "",
            property_images: property_data?.images ?? []
        }

        return await createTransferInDB(transfer_payload);
    }

    return false;
}

export const createTransferInDB = async (payload) => {
    return await Transfers.create(payload);
}

export const makeTransferForWalletPayment = async (user_id, amount = 0) => {
    if (amount > 0 && user_id) {
        const transfer_payload = {
            transfer_type: ETRANSFER_TYPE.rechargeWallet,
            is_from_admin: true,
            to: user_id,
            amount: amount,
            from_currency: "USD",
            to_currency: "NGN",
        }

        console.log(transfer_payload, '====transfer_payload')

        return await createTransferInDB(transfer_payload);
    }

    return false;
}

export const transferForWalletRecharge = async (user_id, from_currency = "USD", to_currency = "NGN", amount) => {
    const get_connected_account = await AccountServices.getUserConnectedAccount(user_id);
    if (get_connected_account) {
        const converted_currency = await CommonHelpers.convert_currency(
            to_currency,
            from_currency,
            Number(amount)
        )

        console.log(converted_currency, '=====converted_currency');
        if (converted_currency && converted_currency.amount > 0) {
            const initiate_transfer = await StripeCommonServices.transferFunds(
                get_connected_account.connect_acc_id,
                Number(converted_currency.amount),
                from_currency
            );

            if (initiate_transfer?.id) {
                const payload = {
                    transfer_type: ETRANSFER_TYPE.rechargeWallet,
                    is_from_admin: true,
                    to: user_id,
                    amount: amount,
                    from_currency: from_currency,
                    to_currency: to_currency,
                    status: ETRANSFER_STATUS.transferred,
                    destination: initiate_transfer.destination,
                    connect_acc_id: get_connected_account._id,
                    transfer_id: initiate_transfer.id,
                };

                const transfer = new Transfers(payload);
                transfer.save();
                const balance = await StripeCommonServices.getBalance(get_connected_account.connect_acc_id);
                if (balance) {
                    User.findByIdAndUpdate(user_id, {
                        walletPoints: (balance.available[0]?.amount / 100)
                    })
                    .then((updatedUser) => {
                            console.log(updatedUser, '====updatedUser Wallet')
                        })
                }
                return transfer;
            }
            return false;
        }
        return false;
    }
    return false;
}