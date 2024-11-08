import Stripe from "stripe";
import ConnectedAccounts from "../models/connectedAccounts.model.mjs";
import { User } from "../models/user.model.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const addInWalletService = async (body) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: body.amount,
    currency: "usd",
  });

  return {
    data: { clientSecret: paymentIntent },
    message: "logged in successfully",
    status: true,
    statusCode: 200
  };
}

export const updateWalletPointsFromWebhook = (event) => {
  if (event?.account) {
    ConnectedAccounts.findOne({
      connect_acc_id: event.account,
      isDeleted: false
    }).then(account => {
      if (account?.user_id) {
        if (event?.data?.object) {
          User.findByIdAndUpdate(account?.user_id, {
            walletPoints: (event?.data?.object?.available[0]?.amount / 100)
          })
          // .then((updatedUser) => {
          //   // console.log(updatedUser, '====updatedUser')
          // })
        }
      }
    });
  }
}

// export { addInWalletService };
