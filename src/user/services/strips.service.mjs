import Stripe from "stripe";
import { Transaction } from "../models/transactions.model.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function addStripeTransaction(body) {

    console.log(body, "---=-=body")

    console.log(body.data.object.metadata   , "//////////////")

    console.log(body.data.metadata)
   


  

}

export { addStripeTransaction };
