const flutterWaveBaseUrl = `https://api.flutterwave.com`;
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Bills from "../models/bills.model.mjs";
import * as electricityEmails from "../emails/electricity.emails.mjs";
import { User } from "../models/user.model.mjs";
import * as Constants from "../enums/common.mjs"
import { ERefundfor } from "../enums/refunds.enum.mjs";
import Refunds from "../models/refunds.model.mjs";

const config = {
    headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET}`,
        'Content-Type': 'application/json'
    }
}

/**
 * @description To fetch billers according to category code and country code
 * @param {string} category_code Category code from top-bill-categories of flutterwave
 * @param {string} country_code Country code whose billers are to be fetched
 * @returns {Array | Error} Array of biller objects representing the billers that were fetched from the flutterwave
 */
export const getBillers = (category_code = "CABLEBILLS", country_code = "NG") => {
    const url = `${flutterWaveBaseUrl}/v3/bills/${category_code}/billers?country=${country_code}`;
    return new Promise((resolve, reject) => {
        axios.get(url, config)
            .then(response => resolve(response?.data))
            .catch(error => {
                reject(new Error(error?.response?.data?.message ?? error))
            });
    })
}

// console.log(await getBillers())

/**
 * @description To get all the bills of a biller from flutterwave
 * @param {string} biller_code The biller code whose bills need to be fetched 
 * @returns {Array | Error } Array of bills objects from flutterwave
 */
export const getBillerBills = (biller_code = "BIL119") => {
    const url = `${flutterWaveBaseUrl}/v3/billers/${biller_code}/items`;
    return new Promise((resolve, reject) => {
        axios.get(url, config)
            .then(response => resolve(response?.data))
            .catch(error => {
                reject(new Error(error?.response?.data?.message ?? error))
            });
    })
}

/**
 * @description To validate customer or bill details before initiating payment request
 * @param {string} item_code Bill code to check for customer or bill details
 * @param {string} biller_code The biller code whose bills need to be validated 
 * @param {string} customer The meter id or the customer id associated with the bill
 * @returns {Object} Returns object with varified bill details
 */
export const validateBill = (item_code, biller_code, customer) => {   // customer is meter number
    const url = `${flutterWaveBaseUrl}/v3/bill-items/${item_code}/validate?code=${biller_code}&customer=${customer}`;
    return new Promise((resolve, reject) => {
        axios.get(url, config)
            .then(response => resolve(response?.data))
            .catch(error => {
                console.log(error, '====error validate');
                reject(new Error(error?.response?.data?.message ?? error))
            });
    })
}

/**
 * Initiates a payment request to the Flutterwave API.
 *
 * @param {Object} params - The parameters for initiating the payment.
 * @param {string} params.country_code - The country code (default is "NG"). This specifies the country where the payment is being made.
 * @param {string} params.customer - The unique identifier for the customer making the payment. This represents the customer’s ID in the system.
 * @param {number} params.amount - The amount to be paid (default is 0). This represents the payment amount in the specified currency.
 * @param {string} params.biller_code - The code of the biller that the customer is paying. This identifies the organization to which the payment is directed.
 * @param {string} params.item_code - The code of the specific item or service the payment is for. This identifies the item for which the customer is paying.
 * 
 * @returns {Promise} A promise that resolves with the response data from the Flutterwave API, or rejects with an error message.
 */
export const initiatePayment = ({
    country_code = "NG", // Default country code is "NG" (Nigeria)
    customer,   // Customer's unique ID Or Meter Number
    amount, // Amount to pay for the bill
    biller_code, // The biller's code that identifies the recipient
    item_code, // The specific item code associated with the bill
}) => {
    const payload = {
        country: country_code,
        customer_id: customer,
        amount: amount,
        reference: uuidv4()
    }
    const url = `${flutterWaveBaseUrl}/v3/billers/${biller_code}/items/${item_code}`;
    return new Promise((resolve, reject) => {
        axios.post(url, payload, config)
            .then(response => resolve(response?.data))
            .catch(error => {
                reject(new Error(error?.response?.data?.message ?? error))
            });
    })
}

/**
 * Generates a link for the checkout page to charge
 * 
 * @param {Object} param - The parameters to pass to the payment API
 * @param {number} params.amount - The amount to be charged
 * @param {string} params.customer_email - The email address of the customer
 * @param {string} params.customer_phone_number - The phone number of the customer
 * @param {string} params.customer_name - The full name name of the customer
 * @param {string} params.meta_data - The meta data to be sent in payload and you will get this in webhook
 * @returns {Object | Error} - The response object containing the link to the payment page
 */
export const createCharge = ({
    amount,
    customer_email,
    customer_phone_number,
    customer_name,
    meta_data   // Object containing information about the payment
}) => {
    // process the request and create the charge here
    const url = `${flutterWaveBaseUrl}/v3/payments`;
    const payload = {
        amount: amount,
        tx_ref: uuidv4(),
        customer: {
            email: customer_email,
            phone_number: customer_phone_number ?? "",
            name: customer_name ?? "",
        },
        currency: "NGN",
        redirect_url: `${process.env.FRONTEND_URL}/electricity-recharge`,
        meta: meta_data
    }
    return new Promise((resolve, reject) => {
        axios.post(url, payload, config)
            .then(response => resolve(response?.data))
            .catch(error => {
                reject(new Error(error?.response?.data?.message ?? error))
            });
    })
}

/**
 * Intitiate bill payment when customer is charged for bill payment
 * 
 * @param {Object} webhook_obj - The webhook object that returned from flutterwave after charge successful callback
 * @returns {void} - Nothing 
 */
export const initiateBillPaymentFromWebhook = async (webhook_obj) => {
    try {
        const { meta_data } = webhook_obj;
        User.findById(meta_data.user_id).then((user) => {
            Bills.create({
                user_id: meta_data.user_id,
                amount_charge_to_cust: webhook_obj.amount,
                bill_amount: meta_data.amount,
            }).then(async (bill) => {
                const initiatePayment = await initiatePayment({
                    country_code: meta_data?.country_code ?? "NG",
                    customer: meta_data.meter_number,
                    amount: meta_data.amount,
                    biller_code: meta_data.biller_code,
                    item_code: meta_data.item_code,
                });

                if (initiatePayment) {
                    Bills.findByIdAndUpdate(bill._id, {
                        phone_number: initiatePayment?.phone_number ?? "",
                        bill_amount: initiatePayment?.amount,
                        network: initiatePayment?.network ?? "",
                        code: initiatePayment?.code ?? "",
                        tx_ref: initiatePayment?.tx_ref ?? "",
                        reference: initiatePayment?.reference ?? "",
                        batch_reference: initiatePayment?.batch ?? "",
                        recharge_token: initiatePayment?.recharge_token ?? "",
                        fee: initiatePayment?.fee,
                        transaction_id: webhook_obj.id,
                        meter_number: meta_data.meter_number
                    },
                        {
                            new: true
                        }).then((updatedBill) => {
                            electricityEmails.electricityBillInitiated({
                                email: user.email,
                                fullName: user.fullName,
                                amount: updatedBill.amount_charge_to_cust,
                                meter_number: meta_data.meter_number
                            });
                        })
                }
            }).catch((error) => {
                // logic to refund for charge created before
                createBillRefund(webhook_obj.id, null, meta_data.meter_number);
            })
        })
    } catch (error) {
        // Logic to refund for charge created before
        createBillRefund(webhook_obj.id, null, meta_data.meter_number);
    }
}

/**
 * Verifies that the transaction on flutterwave
 * 
 * @param {string} transaction_id - The id of the transaction that needs to be verified
 * @returns {Object} - Object containing transaction data
 */
export const verifyTransaction = (transaction_id) => {
    const url = `${flutterWaveBaseUrl}/v3/transactions/${transaction_id}/verify`;
    return new Promise((resolve, reject) => {
        axios.get(url, config)
            .then(response => resolve(response?.data))
            .catch(error => {
                reject(new Error(error?.response?.data?.message ?? error))
            });
    })
}

// console.log(await verifyTransaction("8240284"))

/**
 * Initiate refund on flutterwave
 * 
 * @param {string} transaction_id - The id of the transaction whose amount to be refunded
 * @param {number} amount - The amount if partial refund
 * @returns {Object | Error} - The refund object from flutterwave
 */
export const createRefund = async (transaction_id, amount = 0) => {
    const url = `${flutterWaveBaseUrl}/v3/transactions/${transaction_id}/refund`;
    const payload = {
        comments: "Bill payment refund"
    }
    if (amount > 0) {                 // In Case of partial refund
        payload.amount = amount
    }
    return new Promise((resolve, reject) => {
        axios.post(url, payload, config)
            .then(response => resolve(response?.data))
            .catch(error => {
                reject(new Error(error?.response?.data?.message ?? error))
            });
    })
}

// console.log(await createRefund("8238271"))

export const createBillRefund = async (transaction_id, bill_id, meter_number) => {
    const verifyTransaction = await verifyTransaction(transaction_id);  // Verify transaction in flutterwave before initiating refunds
    if (verifyTransaction) {
        const createRefund = await createRefund(transaction_id);
        if (createRefund) {
            const payload = {
                gateway_type: Constants.PAYMENT_GATEWAYS.FLUTTERWAVE,
                type: ERefundfor.bill_payment,
                bill_id: bill_id ?? null,
                user_id: verifyTransaction?.data?.meta?.user_id,
                refund_id: createRefund?.data?.id,
                account_id: createRefund?.data?.account_id,
                tx_id: createRefund?.data?.tx_id,
                flw_ref: createRefund?.data?.flw_ref,
                wallet_id: createRefund?.data?.wallet_id,
                amount_refunded: createRefund?.data?.amount_refunded,
                status: createRefund?.data?.status,
                destination: createRefund?.data?.destination,
                comments: createRefund?.data?.comments,
                reference: createRefund?.data?.reference,
                fee: createRefund?.data?.fee
            }

            Refunds.create(payload).then(refund_data => {
                User.findById(refund_data.user_id).then(user => {
                    electricityEmails.electricityBillRefundInitiated({
                        email: user.email,
                        fullName: user.fullName,
                        amount: refund_data.amount_refunded,
                        meter_number: meter_number
                    });
                    if (refund_data.bill_id) {
                        Bills.findByIdAndUpdate(refund_data.bill_id, {
                            refund_id: refund_data._id
                        }).then(update_bill => {
                        })
                    }
                })
            })
        }
    }
}

export const updateBillStatusFromWebhook = async (webhook_obj) => {
    Bills.findOneAndUpdate({
        reference: webhook_obj?.data?.flw_ref
    }, {
        status: webhook_obj?.data?.status
    }, {
        new: true
    }).then(bill => {
        User.findById(bill.user_id)
            .then(user => {
                const payload = {
                    email: user.email,
                    fullName: user.fullName,
                    amount: bill.amount_charge_to_cust,
                    meter_number: webhook_obj?.data?.customer
                };

                switch (bill.status) {
                    case "successful":
                        electricityEmails.electricityBillPaid(payload)
                        break;

                    case "failed":
                        electricityEmails.electricityBillFailed(payload);

                        // Bellow write a code for refund
                        createBillRefund(bill.transaction_id, bill._id, bill.meter_number);
                        break;

                    default:
                        break;
                }
            })
    })
}