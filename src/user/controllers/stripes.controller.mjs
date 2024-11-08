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
        console.log(wallet, "===wallet value")
        body.paymentMethod = "stripe"

        if (wallet === "true") {
            const data = await rechargeWallet(body);
            sendResponse(res, data.data, data.message, data.status, data.statusCode);
        } else {

            const { propertyID } = body.data.object.metadata;
            const property = await Property.findById(propertyID);
            console.log("payment count ===>", property.payment_count)
            if (property.payment_count === 0) {
                const data = await addStripeTransaction(body, renterApplicationID);
                sendResponse(res, data.data, data.message, data.status, data.statusCode);
            } else {
                const data = await addStripeTransactionForOld(body, renterApplicationID);
                sendResponse(res, data.data, data.message, data.status, data.statusCode);
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
            console.log("Payout case meet")
            PayoutServices.updateStatusFromWebhook(body)
            break;

        case "balance.available":
            console.log("Balance available case meet")
            WalletServices.updateWalletPointsFromWebhook(body);
            break;

    }

    res.json({ received: true });
}

async function paystack(req, res) {

    // const testSecretKey = "sk_test_853a8821768ec289d7692eaadf8e920edf7afb70";
    // console.log(req.body, "-------------Pay Stack")
    let { body } = req;
    // body = JSON.parse(JSON.stringify(body));
    body.paymentMethod = "paystack"
    if (req.body.event === "charge.success") {
        let metadata = req.body.data.metadata;
        if (req?.body?.data?.reference?.includes("wallet")) {
            metadata = CommonHelpers.makePaystackMetaDataObjForNative(req?.body?.data?.reference);
        }
        // console.log(metadata, '======metadata111');
        delete body.metadata;
        body.data.metadata = metadata;
        // console.log(body.metadata, '======body.metadata222');

        // const hash = createHmac('sha512', testSecretKey).update(JSON.stringify(req.body)).digest('hex');
        if (true) {
            const { wallet, renterApplicationID } = metadata;

            // console.log(wallet, "----------------------------> wallet")
            // console.log(req?.body?.data?.metadata?.custom_fields, "--------------> req.body.data.metadata?custom_fields:")
            // console.log(JSON.stringify(req?.body?.data?.metadata?.custom_fields), "--------------> JSON.stringify(req?.body?.data?.metadata?.custom_fields)")
            // console.log(wallet === "true", '======wallet === "true"');

            if (wallet === "true") {
                const data = await rechargeWallet(body);
                return res.sendStatus(200);
            } else {
                const { propertyID } = metadata;
                const property = await Property.findById(propertyID);
                if (property) {
                    // console.log("payment count ===>", property.payment_count)
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
