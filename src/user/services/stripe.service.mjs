import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function payRentService(body) {

    const { amount } = body;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true,
        },
    });

    return {
        data: {client_secret :paymentIntent.client_secret } ,
        message: "client secret created successfully",
        status: true,
        statusCode: 200,
    };
}

export { payRentService };
