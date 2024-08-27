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

  // const engineer = await this.userServices.getUser(user?.id);
  // if (!engineer) {
  //   return response(
  //     res,
  //     { errors: "No user data found!" },
  //     RESPONSE_CODES.ERROR
  //   );
  // }
  // console.log(engineer, "====engineer");

  // var uname = engineer?.fullName.split(" ");

  // console.log(uname, "====uname");

 

  // console.log(body, "====body");

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

  console.log(token, "====token");

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
      // address: {
      //   line1: engineer?.address?.area,
      //   city: engineer?.address?.city,
      //   postal_code: engineer?.address?.pinCode,
      //   state: engineer?.address?.city,
      //   country: body.country,
      // },
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

  console.log(saccount, "=========saccount");

  const externalAccount = await stripe.accounts.createExternalAccount(
    saccount.id,
    {
      external_account: token.id,
    }
  );

   console.log(externalAccount, "===============externalAccount");

  // body.bankToken = saccount.id;
  // body.bankStatus = saccount.individual.verification.status;
  // body.requirements = saccount.individual.requirements.eventually_due;
  // body.capabilities = saccount.capabilities;
  // body.userId = engineer?.id;

  // const account = await this.services.postBankAccounts(body);

}

export { addInWallet , withdraw};
