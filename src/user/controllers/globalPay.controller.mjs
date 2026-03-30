import { sendResponse } from "../helpers/sendResponse.mjs";
import { payViaGlobalPayService } from "../services/globalPay.service.mjs";
import crypto from "crypto";
import { Property } from "../models/property.model.mjs";
// import { addFlutterwaveTransactionUnified } from "../services/rentpayment.service.mjs";

export const payViaGlobalPay = async (req, res) => {
    try {
        const payload = req.body;
        if (payload?.amount > 0) {
            const userData = req.user.data;
            const result = await payViaGlobalPayService(payload, userData);
            const resObj = {
                // url: cryptoServices.encryptionForFrontend(result?.data?.checkoutUrl)
                url: result?.data?.checkoutUrl
            }

            return sendResponse(res, resObj, "Success", true, 200);
        } else {
            return sendResponse(res, null, "Amount should be greater than 0", false, 400);
        }
    } catch (error) {
        console.log(error, '========errro')
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}


function decryptPayload(cipherText, keyText) {
    try {
        const fullCipher = Buffer.from(cipherText, 'base64');
        const key = Buffer.from(keyText, 'utf8');

        // Extract IV from the beginning of the cipher text 
        const iv = fullCipher.slice(0, 16);
        const encryptedText = fullCipher.slice(16);
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        decipher.setAutoPadding(true);

        let decrypted = decipher.update(encryptedText, 'binary', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.log(error, '===========error')
        return false;
        return error.message
            || (error.cause && error.cause.message)
            || 'An error occurred during decryption';
    }
}

export const globalPayWebhook = async (req, res) => {
    try {

        console.log('======================================');
        console.log('   GLOBAL PAY WEBHOOK CALLED');
        console.log('======================================');

        const { body } = req;
        console.log(req.headers, '=============req.header')
        console.log(body, '====================body 1111111111')

        const encryptedRequest = req.body.Request;

        if (!encryptedRequest) {
            return res.json({
                ResponseCode: "99",
                ResponseDescription: "Invalid payload",
                Status: false
            });
        }

        // Your merchant API key (IMPORTANT: keep in env file)
        const API_KEY = process.env.GLOBAL_PAY_API_KEY;
        console.log(API_KEY, '=====================API_KEY')
        const decryptedString = decryptPayload(encryptedRequest, API_KEY);

        if (!decryptedString) {
            return res.json({
                ResponseCode: "99",
                ResponseDescription: "Decryption failed",
                Status: false
            });
        }

        console.log(decryptedString, '====================decryptedString decryptedString')
        const data = JSON.parse(decryptedString);

        console.log("Webhook Data:", data);

        // Validate transaction
        if (data && data.TransactionReference) {

            // Calculation final amount charged to customer
            let finalAmount;
            if (data.ChargeOn === "ChargeMerchant") {
                finalAmount = data.InAmount;
            } else if (data.ChargeOn === "ChargeCustomer") {
                finalAmount = Number(data.InAmount) + Number(data.TransactionFee || 0);
            }

            // Adding amout to data object to send on webhook functions
            data.finalAmount = finalAmount;

            // Meta data is saved in array of objects form in global pay, converting it to object to simply and run same as old funtions
            let meta_data = null;
            if (data?.Data && Array.isArray(data.Data) && data.Data.length > 0) {
                meta_data = Object.fromEntries(
                    data.Data.map(item => [item.Name, item.Value])
                );
            }

            // Adding meta data in data object to send on webhook functions
            data.meta_data = meta_data;

            // Telling is payment is made from global pay
            data.payment_mode = "global pay";


            console.log(meta_data, '==============meta_data');
            console.log(data, '==============final body object after description');

            // TODO: Update your database here
            // handling db functions
            const { wallet, renterApplicationID, propertyID } = meta_data;

            // If transaction is related to wallet then calling wallet function
            // if (wallet === "true") {
            //     addToWallet(data, meta_data)
            // } else {

            //     // If Not wallet then considering it as property payment if property found
            //     let property = await Property.findById(propertyID);
            //     if (property) {
            //         // If property have 0 payment, considering it as new property for rent or first payment of rent
            //         if (!property.payment_count || property.payment_count == 0) {
            //             // await addFlutterwaveTransaction(data, renterApplicationID)

            //             data.renterApplicationID = renterApplicationID;
            //             await addFlutterwaveTransactionUnified(data, {
            //                 renterApplicationID: renterApplicationID,
            //                 handleLeaseEnd: true,
            //                 handleReferral: true
            //             });
            //         } else if (property.payment_count > 0) {
            //             // If property already have payments then considering it as already rented and paying rent amount
            //             await addFlutterwaveTransactionUnified(data)
            //         }
            //     }
            // }

            return res.json({
                ResponseCode: "00",
                ResponseDescription: "Request was successful",
                Status: true
            });
        }

        return res.json({
            ResponseCode: "99",
            ResponseDescription: "Invalid transaction data",
            Status: false
        });
    } catch (error) {
        console.log(error, '======== error In Flutterwave webhook')
    }
};
