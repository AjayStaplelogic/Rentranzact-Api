import { addInWalletService } from "../services/wallet.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function addInWallet(req, res) {
  const { body } = req;

  const data = await addInWalletService(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function withdraw(req, res) {

  
  var today = new Date();
  var time = today.getTime() / 1000;
  const token = await stripe.tokens.create({
    bank_account: {
      country: "NG",
      currency: "NGN",
      account_holder_name: "test",
      account_holder_type: "individual",
      account_number: "1111111112",
      routing_number: "AAAAALTXXXX",
    },
  });

  const saccount = await stripe.accounts.create({
    type: "custom",
    country: "NG",
    capabilities: {
      card_payments: {
        requested: false,
      },
      transfers: {
        requested: true,
      },
    },
    business_type: "individual",
    individual: {
      email: "test@gmail.com",
      first_name: "test",
      last_name: "test",
      full_name_aliases: ["tester"],
      phone: "9988883922",
    },
    business_profile: {
      mcc: "7379",
      name: `Rentranzact`,
      url: "https://rentranzact.com",
    },
    tos_acceptance: {
      date: Math.round(time),
      ip: req?.socket?.remoteAddress,
      service_agreement: "recipient",
    },
  });


  const externalAccount = await stripe.accounts.createExternalAccount(
    saccount.id,
    {
      external_account: token.id,
    }
  );
}

export { addInWallet , withdraw};
