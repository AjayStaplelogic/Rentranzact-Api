import Stripe from "stripe";
import { Transaction } from "../models/transactions.model.mjs";
import { Property } from "../models/property.model.mjs";
import { RentType } from "../enums/property.enums.mjs";
import moment from "moment";
import { User } from "../models/user.model.mjs";
import { RentingHistory } from "../models/rentingHistory.model.mjs";
import { Wallet } from "../models/wallet.model.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function addStripeTransaction(body) {

    const { userID, propertyID } = body.data.object.metadata;

    const { amount, status, created, id } = body.data.object;

    const propertyDetails = await Property.findById(propertyID);

    if (propertyDetails.rentType === RentType.MONTHLY) {

        const originalDate = moment.unix(created);

        const oneMonthLater = originalDate.add(1, 'months');

        const timestampOneMonthLater = oneMonthLater.unix();

        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created, rent_period_end: timestampOneMonthLater })

        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneMonthLater, rentingStart: created, propertyID: propertyID, renterActive: true })

        addRenterHistory.save()

        // console.log(timestampOneMonthLater, "-------------timestampOneMonthLater")

    } else if (propertyDetails.rentType === RentType.QUATERLY) {
        // Convert timestamp to a Moment.js object
        const originalDate = moment.unix(created);

        // Add one year to the original date
        const oneQuaterLater = originalDate.add(3, 'months');

        // Get the Unix timestamp of one year later
        const timestampOneQuaterLater = oneQuaterLater.unix();
        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created, rent_period_end: timestampOneQuaterLater })

        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneQuaterLater, rentingStart: created, propertyID: propertyID, renterActive: true })


        // console.log(timestampOneQuaterLater, "------------------timestampOneQuaterLater")


        addRenterHistory.save()

    } else if (propertyDetails.rentType === RentType.YEARLY) {
        // Convert timestamp to a Moment.js object
        const originalDate = moment.unix(created);

        // Add one year to the original date
        const oneYearLater = originalDate.add(1, 'yearly');

        // Get the Unix timestamp of one year later
        const timestampOneYearLater = oneYearLater.unix();

        // console.log(timestampOneYearLater, "-----timestampOneYearLater")
        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created, rent_period_end: timestampOneYearLater })

        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneYearLater, rentingStart: created, propertyID: propertyID, renterActive: true })
        addRenterHistory.save()
    }

    const renterDetails = await User.findById(userID);

    const landlordDetails = await User.findById(propertyDetails.landlord_id)

    const data = new Transaction({wallet : false, renterID: userID, propertyID: propertyID, amount: amount, status: status, date: created, intentID: id, property: propertyDetails.propertyName, renter: renterDetails.fullName, landlord: landlordDetails.fullName, landlordID: landlordDetails._id, type: "DEBIT", payment_mode : "stripe" })



    data.save()

    return {

        data: [],
        message: "success",
        status: true,
        statusCode: 200,

    }



}

async function rechargeWallet(body) {

    const { userID } = body.data.object.metadata;

    const { amount, status, created, id } = body.data.object;

    const payload = {
        amount,
        status,
        createdAt: created,
        type: "CREDIT",
        userID,
        intentID: id
    }

    if (status === "succeeded") {

        const data__ = await User.findByIdAndUpdate(
            userID,
            { $inc: { walletPoints: amount } },
            { new: true }
        );

    }

    const data = new Wallet(payload)
    data.save()

    const data_ = new Transaction({wallet : true ,renterID: userID, amount: amount, status: status, date: created, intentID: id, type: "CREDIT", payment_mode : "stripe" })

    data_.save()




    return {

        data: [],
        message: "success",
        status: true,
        statusCode: 200,

    }



}

export { addStripeTransaction, rechargeWallet };
