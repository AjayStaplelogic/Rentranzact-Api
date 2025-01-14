import Transfers from "../models/transfers.model.mjs";
import { ETRANSFER_STATUS, ETRANSFER_TYPE } from "../enums/transfer.enums.mjs";
import { Property } from "../models/property.model.mjs";
import * as AccountServices from "../services/account.service.mjs";
import * as CommonHelpers from "../helpers/common.helper.mjs";
import * as StripeCommonServices from "../services/stripecommon.service.mjs";
import { User } from "../models/user.model.mjs";
import * as NotificationService from "./notification.service.mjs";
import { transferSucceedEmail } from "../emails/transfer.emails.mjs";
import { ENOTIFICATION_REDIRECT_PATHS } from "../enums/notification.enum.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

/**
 * To make transfer request to admin from landlord when renter pays rent 
 * 
 * @param {object} property_data Object containing property data, can also be null
 * @param {string} property_id, If property_data is null then send it's property id
 * @param {number} amount rent amount to be transferred
 * @returns {object} Newly created transfer object
 */
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

/**
 * To create a transfer in a database
 * 
 * @param {object} payload transfer object to be created in DB 
 * @returns {object} Newly created transfer object
 */
export const createTransferInDB = async (payload) => {
    return await Transfers.create(payload);
}

/**
 * 
 * When user recharges their wallet then sending transfer request to admin
 * 
 * @param {string} user_id Id of the receiver user
 * @param {number} amount Amount to transfer
 * @returns {Object} Newly created transfer object from DB
 */
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

        return await createTransferInDB(transfer_payload);
    }

    return false;
}

/**
 * When user recharges their wallet then transferring amount to their account
 * 
 * @param {string} user_id Id of the user who initiated recharge their wallet
 * @param {string} from_currency Admin currency or currency of the account from which transfer is received
 * @param {string} to_currency Currency of the benificiary account to which transfer is received 
 * @param {number} amount Amount to be transferred
 * @returns {Object | boolean} Transfer object or false if transfer is unsuccessful
 */
export const transferForWalletRecharge = async (user_id, from_currency = "USD", to_currency = "NGN", amount) => {
    const get_connected_account = await AccountServices.getUserConnectedAccount(user_id);       // Checking user have their connected stripe account or not
    if (get_connected_account) {
        const converted_currency = await CommonHelpers.convert_currency(    // Stripe does not support USD TO NGN transfer, so we converted NGN to USD, and then tranferring amount in USD
            to_currency,
            from_currency,
            Number(amount)
        )

        if (converted_currency && converted_currency.amount > 0) {
            const initiate_transfer = await StripeCommonServices.transferFunds(         // Inititating stripe transfer to benificiary account
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

                const transfer = new Transfers(payload);        // Creating transfer entry in DB if stripe transfer successful
                transfer.save();
                const balance = await StripeCommonServices.getBalance(get_connected_account.connect_acc_id); // After transfer fetching balance of connected account
                if (balance) {
                    User.findByIdAndUpdate(user_id, {           // Updating user data with balance available in connected account
                        walletPoints: ((balance.available[0]?.amount + balance.pending[0]?.amount) / 100)
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

export const sendTransferNotificationAndEmail = (options) => {
    let { transferDetials } = options;    
    User.findById(transferDetials.to).then(receiver_details => {

        // Sending email notification to landlord
        transferSucceedEmail({
            email: receiver_details.email,
            fullName: receiver_details.fullName,
            amount: transferDetials.amount,
            property_name: transferDetials.property_name,
        });

        // Sending system notification to landlord
        const notification_payload = {};
        notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.wallet_view;
        notification_payload.notificationHeading = `Rentranzact has approved the rent payment for property '${transferDetials.property_name}' and transferred to your wallet`;
        notification_payload.notificationBody = `Rentranzact has approved the rent payment for property '${transferDetials.property_name}' and transferred to your wallet`;
        notification_payload.landlordID = receiver_details.role === UserRoles.LANDLORD ? receiver_details._id : null;
        notification_payload.propertyID = transferDetials.property_id;;
        notification_payload.send_to = transferDetials.to;
        notification_payload.property_manager_id = receiver_details.role === UserRoles.PROPERTY_MANAGER ? receiver_details._id : null;
        const metadata = {
            "propertyID": transferDetials.property_id.toString(),
            "redirectTo": "wallet_view",
        }
        NotificationService.createNotification(notification_payload, metadata, receiver_details)
    });
}
