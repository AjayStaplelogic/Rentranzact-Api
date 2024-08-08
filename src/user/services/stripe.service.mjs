import Stripe from "stripe";
import { User } from "../models/user.model.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function payRentService(body, userID) {

    const { amount, propertyID, wallet } = body;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'ngn',
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            propertyID: propertyID,
            userID: userID,
            wallet : wallet
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

    const { amount, wallet  } = body;


    // console.log(amount, wallet  , "=======amopunt wallet ")

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'ngn',
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            wallet : wallet,
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

async function payViaWallet(propertyID, userID, propertyDetails, amount, landlordID, renterDetails, walletPoints) {
    if(amount > walletPoints) {

        return {
            data: [],
            message: "Insufficient Amount in wallet",
            status: false,
            statusCode: 400,
        };

    } else {

        const data = await User.findByIdAndUpdate(userID , { $inc: { walletPoints : -amount }});
        const data1 = await User.findByIdAndUpdate(landlordID , {$inc : {walletPoints : amount}})

    }
}

export { payRentService, addToWallet , payViaWallet };
