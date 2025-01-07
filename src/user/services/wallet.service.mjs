import Stripe from "stripe";
import ConnectedAccounts from "../models/connectedAccounts.model.mjs";
import { User } from "../models/user.model.mjs";
import * as StripeCommonServices from "../services/stripecommon.service.mjs";

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
            walletPoints: ((event?.data?.object?.available[0]?.amount + event?.data?.object?.pending[0]?.amount) / 100)
          })
            .then((updatedUser) => {
            })
        }
      }
    });
  }
}

export const fetchBalanceAndUpdateWalletPoints = async (user_id, connect_acc_id) => {
  if (connect_acc_id) {
    const balance = await StripeCommonServices.getBalance(connect_acc_id);
    if (balance) {
      User.findByIdAndUpdate(user_id, {
        walletPoints: ((balance.available[0]?.amount + balance.pending[0]?.amount) / 100)
      })
        .then((updatedUser) => {
        })
    }
  }
}

