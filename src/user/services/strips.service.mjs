import Stripe from "stripe";
import { Transaction } from "../models/transactions.model.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function addStripeTransaction(body) {

    console.log(body.data.object.metadata, "//////////////")

    const { userID, propertyID } = body.data.object.metadata;

    const { amount, status, created, id } = body.data.object;

    const data = new Transaction({ renterID: userID, propertyID: propertyID, amount: amount, status: status, date: created, intentID: id })

    data.save()

    return {

        data: [],
        message: "success",
        status: true,
        statusCode: 200,

    }



}

export { addStripeTransaction };
