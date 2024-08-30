import { sendResponse } from "../helpers/sendResponse.mjs";
import { addFlutterwaveTransaction, addToWallet, addFlutterwaveTransactionForOld } from "../services/flutterwave.service.mjs";
import { Property } from "../models/property.model.mjs";

async function flutterwave(req, res) {
  const { body } = req;
  console.log(req.body, "=========boddyyyy Flutterwave webhook")
  const { wallet, meta_data } = body;

  if (wallet == "true") {
    const data = await addToWallet(body)
    sendResponse(res, data.data, data.message, data.status, data.statusCode);
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

    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  }
}

export { flutterwave };
