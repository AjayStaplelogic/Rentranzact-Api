import { addFlutterwaveTransaction, addToWallet, addFlutterwaveTransactionForOld } from "../services/flutterwave.service.mjs";
import { Property } from "../models/property.model.mjs";
import * as ElectricityService from "../services/electricity.service.mjs";
import * as RefundService from "../services/refund.service.mjs";
import * as Constants from "../enums/common.mjs"

async function flutterwave(req, res) {
  try {
    const { body } = req;
    console.log(body, '====================body 1111111111')
    // switch (req.body["event.type"]) {
    //   case 'CARD_TRANSACTION':
    //     const meta_data = req.body.meta_data;
    //     switch (meta_data.type) {
    //       case 'initiated-bill-payment':
    //         ElectricityService.initiateBillPaymentFromWebhook(req.body);
    //         return res.status(200).end();
    //         break;
    //       default:
    //         break;
    //     }
    //     break;

    //   case 'SingleBillPayment':        // Use to handle electricity bill payment
    //     ElectricityService.updateBillStatusFromWebhook(req.body);
    //     return res.status(200).end();
    //     break;
    //   default:
    //     break;
    // }  

    if (req.body["event.type"] === "SingleBillPayment") {       // Update bill status in DB
      ElectricityService.updateBillStatusFromWebhook(req.body);
      return res.status(200).end();
    }

    console.log("*********** Passed Switch Case ***********");
    if (req.body["event"] === "charge.completed") {
      if (body?.data?.status === "successful") {
        const { meta_data } = body;

        if (meta_data.type === "initiated-bill-payment") {            // Inititate bill payment after succesfully collected from customer
          ElectricityService.initiateBillPaymentFromWebhook(req.body);
          return res.status(200).end();
        }

        let { wallet } = meta_data
        console.log(wallet, '============wallet')
        if (wallet === "true") {
          addToWallet(body)
        } else {
          let property = await Property.findById(meta_data.propertyID);
          if (property) {
            if (!property.payment_count || property.payment_count == 0) {
              await addFlutterwaveTransaction(body, meta_data.renterApplicationID)
            } else if (property.payment_count > 0) {
              await addFlutterwaveTransactionForOld(body)
            }
          }
        }
      }
    }
    return res.status(200).end();
  } catch (error) {
    console.log(error, '======== error In Flutterwave webhook')
  }
}

async function flutterwaveRefundsWehook(req, res) {
  // Implement your refund webhook logic here
  RefundService.updateRefundStatusFromWebhook(Constants.PAYMENT_GATEWAYS.FLUTTERWAVE, req.body)
  return res.status(200).end();

}
export { flutterwave, flutterwaveRefundsWehook };
