import { sendResponse } from "../helpers/sendResponse.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import { payRentService, addToWallet ,payViaWallet } from "../services/stripe.service.mjs"

async function payRent(req, res) {
  const { body } = req;

  console.log(body, "====bdoduy")


  if (body.wallet) {

    console.log("came in walle t trueeeeeeeee e  e e e")

    const userID = req.user.data._id;
    const data = await addToWallet(body, userID);
    sendResponse(res, data.data, data.message, data.status, data.statusCode);


  } else if (body.payViaWallet) {
    const propertyID = body.propertyID;
    const userID = req.user.data._id;
    const propertyDetails = await Property.findById(propertyID);
    const amount = propertyDetails.rent;
    const landlordID = propertyDetails.landlord_id;
    const renterDetails = await User.findById(userID);
    const walletPoints = renterDetails.walletPoints;

    const data = await payViaWallet(propertyID, userID, propertyDetails, amount, landlordID, renterDetails, walletPoints);

    sendResponse(res, data.data, data.message, data.status, data.statusCode);

  } else {
    const userID = req.user.data._id;
    const data = await payRentService(body, userID);
    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  }






}

export { payRent };
