import { sendResponse } from "../helpers/sendResponse.mjs";
import { Property } from "../models/property.model.mjs";
import { createHmac } from "crypto"
import { addStripeTransaction, rechargeWallet, addStripeTransactionForOld } from "../services/strips.service.mjs";
import * as AccountSerivices from "../services/account.service.mjs";
import * as PayoutServices from "../services/payout.service.mjs";
import * as CommonHelpers from "../helpers/common.helper.mjs";
import * as WalletServices from "../services/wallet.service.mjs";

async function stripe(req, res) {

    const { body } = req;

    if (body.type === "payment_intent.succeeded") {
        const { wallet, renterApplicationID } = body.data.object.metadata;
        body.paymentMethod = "stripe"
        if (wallet === "true") {
            const data = await rechargeWallet(body);
        } else {
            const { propertyID } = body.data.object.metadata;
            const property = await Property.findById(propertyID);
            if (property.payment_count === 0) {
                const data = await addStripeTransaction(body, renterApplicationID);
            } else {
                const data = await addStripeTransactionForOld(body, renterApplicationID);
            }
        }
    }

    switch (body.type) {
        case "account.updated":
            AccountSerivices.updateAccountFromWebhook(body);
            break;

        case "account.external_account.updated":
            AccountSerivices.updateExternalAccountFromWebhook(body);
            break;

        case "account.external_account.deleted":
            AccountSerivices.deleteExternalAccountFromWebhook(body);
            break;

        case "payout.paid":
        case "payout.failed":
        case "payout.canceled":
            PayoutServices.updateStatusFromWebhook(body)
            break;

        case "balance.available":
            WalletServices.updateWalletPointsFromWebhook(body);
            break;

    }

    res.json({ received: true });
}

async function paystack(req, res) {

    let { body } = req;
    body.paymentMethod = "paystack"
    if (req.body.event === "charge.success") {
        let metadata = req.body.data.metadata;
        if (req?.body?.data?.reference?.includes("wallet")) {
            metadata = CommonHelpers.makePaystackMetaDataObjForNative(req?.body?.data?.reference);
        }
        delete body.metadata;
        body.data.metadata = metadata;
        if (true) {
            const { wallet, renterApplicationID } = metadata;
            if (wallet === "true") {
                const data = await rechargeWallet(body);
                return res.sendStatus(200);
            } else {
                const { propertyID } = metadata;
                const property = await Property.findById(propertyID);
                if (property) {
                    if (property.payment_count === 0) {
                         addStripeTransaction(body, renterApplicationID);
                        return res.sendStatus(200);
                    } else {
                        addStripeTransactionForOld(body, renterApplicationID);
                        return res.sendStatus(200);
                    }
                }
            }
        } 
    }
    return res.sendStatus(200);
}

export { stripe, paystack };
