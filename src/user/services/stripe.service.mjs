import Stripe from "stripe";
import { User } from "../models/user.model.mjs";
import { Property } from "../models/property.model.mjs";
import { RentType } from "../enums/property.enums.mjs";
import moment from "moment";
import { RentingHistory} from "../models/rentingHistory.model.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function payRentService(body, userID) {

    const { amount, propertyID, wallet , renterApplicationID } = body;

    console.log(typeof wallet , "--------wallet typeof ")

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'ngn',
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            propertyID: propertyID,
            userID: userID,
            wallet: wallet,
            renterApplicationID : renterApplicationID
        }
    });

    return {
        data: { client_secret: paymentIntent.client_secret },
        message: "client secret created successfully",
        status: true,
        statusCode: 200,
    };




}


async function addToWallet(body, userID) {

    const { amount, wallet } = body;


    // console.log(amount, wallet  , "=======amopunt wallet ")

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'ngn',
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            wallet: wallet,
            userID: userID
        }
    })


    // console.log(paymentIntent , "=====PAYMENT INTENT  ")

    return {
        data: { client_secret: paymentIntent.client_secret },
        message: "client secret created successfully",
        status: true,
        statusCode: 200,
    };
}

async function payViaWalletService(propertyID, userID, propertyDetails, amount, landlordID, renterDetails, walletPoints) {
    if (amount > walletPoints) {

        return {
            data: [],
            message: "Insufficient Amount in wallet",
            status: false,
            statusCode: 400,
        };

    } else {

        const data_ = await User.findByIdAndUpdate(userID, { $inc: { walletPoints: -amount } });
        const data1 = await User.findByIdAndUpdate(landlordID, { $inc: { walletPoints: amount } })



        // const { amount, status, created, id } = body.data.object;

        const created = Date.now();

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

        const data = new Transaction({ wallet: true, renterID: userID, propertyID: propertyID, amount: amount, status: "success", date: created, intentID: uuidv4(), property: propertyDetails.propertyName, renter: renterDetails.fullName, landlord: landlordDetails.fullName, landlordID: landlordDetails._id, type: "DEBIT", payment_mode: "wallet" })



        return {
            data: [],
            message: "Payment Successfull",
            status: true,
            statusCode: 200,
        };

    }
}

export { payRentService, addToWallet, payViaWalletService };
