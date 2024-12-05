import { sendResponse } from "../helpers/sendResponse.mjs";
import { addFlutterwaveTransaction, addToWallet, addFlutterwaveTransactionForOld } from "../services/flutterwave.service.mjs";
import { Property } from "../models/property.model.mjs";

async function flutterwave(req, res) {
  const { body } = req;
  console.log(req.body, "=========boddyyyy Flutterwave webhook")
  switch (req.body.event.type) {
    case 'CARD_TRANSACTION':
      const meta_data = req.body.meta_data;
      switch (meta_data.type) {
        case 'initiated-bill-payment':
          break;
        default:
          break;
      }
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

export { flutterwave };
