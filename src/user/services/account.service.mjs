import ConnectedAccount from "../models/connectedAccounts.model.mjs";
import { User } from "../models/user.model.mjs";
import Accounts from "../models/accounts.model.mjs";
import ConnectedAccounts from "../models/connectedAccounts.model.mjs";

export const updateAccountFromWebhook = async (event) => {
    // Implement the logic to update the account based on the webhook payload
    // Example: Update the account status based on the 'account_status' field
    // Return the updated account object

    console.log(event, '=======event Update Account From Webhook')

    const data = event?.data?.object;
    if (data) {
        const { metadata } = data;
        console.log(metadata, '============metadata')
        if (metadata?.user_id) {
            const get_user = await User.findById(metadata.user_id);
            if (get_user) {
                const connected_account = await addUpdateAccount(get_user._id, data);
                if (data?.external_accounts?.data?.length > 0) {
                    console.log(`[External Account Length Condition Matched]`)
                    for await (let external_account of data?.external_accounts?.data) {
                        await addUpdateExternalAccount(get_user._id, external_account);
                    }
                }
            }
        }
    }
}

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
        status: account_data?.individual?.verification?.status
    }

    const connected_account = await ConnectedAccounts.findOneAndUpdate(query, payload, { upsert: true, new: true });
    return connected_account;
}

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
        last_four: account_data?.last_four,
        status: account_data?.status,
    }

    const external_account = await Accounts.findOneAndUpdate(query, payload, { upsert: true, new: true });
    return external_account;
}

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