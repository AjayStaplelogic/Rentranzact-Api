import { sendResponse } from "../helpers/sendResponse.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import { payRentService, addToWallet, payViaWalletService, payViaWalletServiceForOld } from "../services/stripe.service.mjs"

async function payRent(req, res) {
  const { body } = req;
  if (body.wallet === "true") {
    const userID = req.user.data._id;
    const data = await addToWallet(body, userID);
    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  } else {
    const userID = req.user.data._id;
    const data = await payRentService(body, userID);
    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  }
}
async function payViaWallet(req, res) {

  const { propertyID, renterApplicationID, notificationID } = req.body;
  const userID = req.user.data._id;
  const propertyDetails = await Property.findById(propertyID);
  const amount = propertyDetails.rent;
  const landlordID = propertyDetails.landlord_id;
  const renterDetails = await User.findById(userID);
  const walletPoints = renterDetails.walletPoints;

  if (amount > walletPoints) {
    return sendResponse(res, [], "Insufficient Amount in wallet", false, 400);
  }

  if (propertyDetails.payment_count === 0) {
    const data = await payViaWalletService(propertyID, userID, propertyDetails, amount, landlordID, renterDetails, walletPoints, renterApplicationID, req.body);
    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  } else {
    const data = await payViaWalletServiceForOld(propertyID, userID, propertyDetails, amount, landlordID, renterDetails, walletPoints, renterApplicationID, req.body)
    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  }
}


export { payRent, payViaWallet };
