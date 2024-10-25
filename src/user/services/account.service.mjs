import { User } from "../models/user.model.mjs";
import Accounts from "../models/accounts.model.mjs";
import ConnectedAccounts from "../models/connectedAccounts.model.mjs";


/**
 * @description when ever account_update webhook event is received, adding and updating connected account and external account
 * @param {object} event This will contain the event object from stripe webhook
 * @return {void} Nothing
 */
export const updateAccountFromWebhook = async (event) => {
    // Implement the logic to update the account based on the webhook payload
    // Example: Update the account status based on the 'account_status' field
    // Return the updated account object

    // console.log(event, '=======event Update Account From Webhook')

    const data = event?.data?.object;
    if (data) {
        const { metadata } = data;
        // console.log(metadata, '============metadata')
        if (metadata?.user_id) {
            User.findById(metadata.user_id).then((get_user) => {
                addUpdateAccount(get_user._id, data);
                if (data?.external_accounts?.data?.length > 0) {
                    console.log(`[External Account Length Condition Matched]`)
                    for (let external_account of data?.external_accounts?.data) {
                        addUpdateExternalAccount(get_user._id, external_account);
                    }
                }
            });
        }
    }
}

/**
 * @description Add and update connected accounts in database
 * @param {string} user_id Id of the user wo initiated add and update of the account
 * @param {object} account_data A valid account object from stripe
 * @returns {connected_account} object containing the connected account information stored in the database
 */
export const addUpdateAccount = async (user_id, account_data) => {
    console.log(account_data, '=====account_data')
    const query = {
        user_id: user_id,
        connect_acc_id: account_data.id,
        isDeleted: false
    }

    const payload = {
        user_id: user_id,
        connect_acc_id: account_data.id,
        business_name: account_data?.business_profile?.name ?? "",
        business_type: account_data?.business_type ?? "",
        country: account_data?.country,
        default_currency: account_data?.default_currency,
        email: account_data?.email,
        payouts_enabled: account_data?.payouts_enabled ?? false,
        charges_enabled: account_data?.charges_enabled ?? false,
        i_first_name: account_data?.individual?.first_name,
        i_last_name: account_data?.individual?.last_name,
        i_maiden_name: account_data?.individual?.maiden_name,
        i_email: account_data?.individual?.email,
        i_phone: account_data?.individual?.phone,
        i_dob: account_data?.individual?.dob,
        i_address: account_data?.individual?.address,
        i_verification_status: account_data?.individual?.status,
        // status: account_data?.individual?.verification?.status
    }

    payload.status = getConnectedAccountState(account_data);
    const connected_account = await ConnectedAccounts.findOneAndUpdate(query, payload, { upsert: true, new: true });
    return connected_account;
}

/**
 * @description Add and update external accounts in database
 * @param {string} user_id Id of the user wo initiated add and update of the account
 * @param {object} account_data A valid external account object from stripe
 * @returns {external_account} object containing the account information stored in the database
 */
export const addUpdateExternalAccount = async (user_id, account_data) => {
    const query = {
        user_id: user_id,
        connect_acc_id: account_data?.account,
        external_acc_id: account_data?.id,
        isDeleted: false
    }

    const payload = {
        user_id: user_id,
        connect_acc_id: account_data?.account,
        external_acc_id: account_data?.id,
        account_holder_name: account_data?.account_holder_name,
        bank_name: account_data?.bank_name,
        country: account_data?.country,
        currency: account_data?.currency,
        routing_number: account_data?.routing_number,
        last_four: account_data?.last4,
        status: account_data?.status,
    }
    // payload.status = getConnectedAccountState(account_data);
    payload.isPrimary = true;
    const external_account = await Accounts.findOneAndUpdate(query, payload, { upsert: true, new: true });
    return external_account;
}

/**
 * @description Whenever external accounts are deleted on stripe, deleting them from the database
 * @param {object} event A valid event object from stripe event
 * @returns {void} Nothing
 */
export const deleteExternalAccountFromWebhook = async (event) => {
    const data = event?.data?.object;
    if (data) {
        await Accounts.updateMany({
            external_acc_id: data?.id,
        }, {
            isDeleted: true
        });
    }
}

/**
 * @description Use to identify the current state of the account
 * @param {object} account_data A valid account object from stripe
 * @returns {string} current status of the account
 */
export const getConnectedAccountState = (account_data) => {
    const reqs = account_data.requirements;

    if (reqs.disabled_reason && reqs.disabled_reason.indexOf("rejected") > -1) {
        return "rejected";
    }

    if (account_data.payouts_enabled && account_data.charges_enabled) {
        if (reqs?.pending_verification?.length > 0) {
            return "pending enablement";
        }

        if ((!reqs?.disabled_reason || reqs.disabled_reason.length === 0) && (!reqs.currently_due || reqs.currently_due.length === 0)) {
            if (!reqs.eventually_due || reqs.eventually_due.length === 0) {
                return "complete";
            } else {
                return "enabled";
            }
        } else {
            return "restricted";
        }
    }

    if (!account_data.payouts_enabled && account_data.charges_enabled) {
        return "restricted (payouts disabled)";
    }

    if (!account_data.charges_enabled && account_data.payouts_enabled) {
        return "restricted (charges disabled)";
    }

    if (reqs?.past_due?.length > 0) {
        return "restricted (past due)";
    }

    if (reqs?.pending_verification?.length > 0) {
        return "pending (disabled)";
    }

    return "restricted";
};

/**
 * @description Fetch primary account of user
 * @param {string | import("mongoose").ObjectId} user_id Id of user
 * @returns {object | Accounts} Account object from database
 */
export const getPrimaryAccount = async (user_id) => {
    return await Accounts.findOne({
        user_id: user_id,
        isPrimary: true,
        isDeleted: false
    })
}

/**
 * @description When external accounts update event fired from stripe then updating data in DB
 * @param {object} event This will contain the event object from stripe webhook.
 * @return {void} Nothing
 */
export const updateExternalAccountFromWebhook = async (event) => {
    const data = event?.data?.object;
    if (data) {
        Accounts.findOne({
            connect_acc_id: event.account,
            external_acc_id: data.id
        }).then(account => {
            if (account) {
                if (!account.account) {
                    account.account = event.account;
                }
                addUpdateExternalAccount(account.user_id, account)
            }
        });
    }
}
