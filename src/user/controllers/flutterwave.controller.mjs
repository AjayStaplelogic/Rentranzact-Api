import { addFlutterwaveTransaction, addToWallet, addFlutterwaveTransactionForOld } from "../services/flutterwave.service.mjs";
import { Property } from "../models/property.model.mjs";
import * as ElectricityService from "../services/electricity.service.mjs";
import * as RefundService from "../services/refund.service.mjs";
import * as Constants from "../enums/common.mjs"

async function flutterwave(req, res) {
  const { body } = req;
  switch (req.body["event.type"]) {
    case 'CARD_TRANSACTION':
      const meta_data = req.body.meta_data;
      switch (meta_data.type) {
        case 'initiated-bill-payment':
          ElectricityService.initiateBillPaymentFromWebhook(req.body);
          return res.status(200).end();
          break;
        default:
          break;
      }
      break;

    case 'SingleBillPayment':        // Use to handle electricity bill payment
      ElectricityService.updateBillStatusFromWebhook(req.body);
      return res.status(200).end();
      break;
    default:
      break;
  }
  const { meta_data } = body;
  let { wallet } = meta_data
  if (wallet === "true") {
    addToWallet(body)
  } else {
    let property = await Property.findById(meta_data.propertyID);
    let data = {}
    if (property) {
      if (!property.payment_count || property.payment_count == 0) {
        data = await addFlutterwaveTransaction(body, meta_data.renterApplicationID)
      } else if (property.payment_count > 0) {
        data = await addFlutterwaveTransactionForOld(body)
      }
    }
  }

  return res.status(200).end();
}

async function flutterwaveRefundsWehook(req, res) {
  // Implement your refund webhook logic here
  RefundService.updateRefundStatusFromWebhook(Constants.PAYMENT_GATEWAYS.FLUTTERWAVE,  req.body)
  return res.status(200).end();

}
export { flutterwave, flutterwaveRefundsWehook };
