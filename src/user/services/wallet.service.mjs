import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
async function addInWalletService(body) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: body.amount,
    currency: "usd",
  });



  return {
    data: {  clientSecret: paymentIntent},
    message: "logged in successfully",
    status: true,
    statusCode: 200 
  };
}

export { addInWalletService };
