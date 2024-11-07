import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

/**
 * Used to create new customer on stripe
 * @param {Object} options contains {fullName, email, phone, _id}
 * @param {string} options.fullName The name of the customer
 * @param {string} options.email The email of the customer
 * @param {string} options.phone The phone number of the customer
 * @param {string} options._id The id of the user from DB
 * @returns {Object} customer object from stripe
 */
export const addCustomer = async (options) => {
    try {
        let { fullName, email, phone, _id } = options;
        // Add customer to your Stripe account.
        const customer = await stripe.customers.create({
            name: fullName ?? "",
            email: email ?? "",
            phone: phone ?? "",
            metadata: {
                user_id: `${_id}`
            }
        });
        return customer;
    } catch (error) {
        throw error;
    }
}

/**
 * creating card token that will be used to create card, this is for testing only
 * Real functionality will be from frontend
 * @param {Object} options contains {number, exp_month, exp_year, cvc, fullName }
 * @param {string} options.number The number on card
 * @param {string} options.exp_month Expiration month of the card
 * @param {string} options.exp_year Expiration year of the card
 * @param {string} options.cvc CVC of the card
 * @param {string} options.fullName Name on the card
 * @returns {Object} token object from stripe
 */
export const createCardToken = async (options) => {
    try {
        let { number, exp_month, exp_year, cvc, fullName } = options;
        const card_token = await stripe.tokens.create({
            card: {
                number: number,
                exp_month: exp_month,
                exp_year: exp_year,
                cvc: cvc,
                name: fullName ?? ""
            },
        });
        return card_token;
    } catch (error) {
        throw error;
    }
}

/**
 * Used to create a new card for customer on stripe
 * @param {Object} options Contains the {customer_id, card_token}
 * @param {string} options.customer_id Customer Id from Stripe
 * @param {string} options.card_token Card token from Stripe, generated on frontend
 * @returns {Object} customer Source object from stripe
 */
export const addCard = async (options) => {
    try {
        let { customer_id, card_token } = options;
        const customerSource = await stripe.customers.createSource(
            customer_id,
            {
                source: card_token,
            }
        );
        return customerSource;
    } catch (error) {
        throw error;
    }
}

/**
 * To delete a card from the customer on stripe
 * @param {Object} options contains { customer_id, card_id }
 * @param {string} options.customer_id Customer Id from stripe
 * @param {string} options.card_id Card Id from stripe
 * @returns {Object} Returns the customer source object from stripe
 */
export const deleteCard = async (options) => {
    try {
        let { customer_id, card_id } = options;
        const customerSource = await stripe.customers.deleteSource(
            customer_id,
            card_id
        );
        return customerSource;
    } catch (error) {
        throw error;
    }
}

/**
 * @description To create connect accounts on stripe
 * @param {object} user should contain valid user data
 * @param {string} user.email email of the user
 * @param {string} user.fullName full name of the user
 * @returns {object} account object from stripe
 */
export const createAccount = async (user) => {
    const account = await stripe.accounts.create({
        type: 'custom',
        country: "NG",
        email: user.email,
        capabilities: {
            transfers: { requested: true, },
        },
        business_type: 'individual',
        business_profile: {
            name: user.fullName,
            product_description: "Test product description"
        },
        tos_acceptance: {
            service_agreement: 'recipient',
        },
        // settings: {
        //     payouts: {
        //         schedule: {
        //             interval: "manual"
        //         }
        //     }
        // },
        metadata: {
            user_id: user._id,
        },
    });
    console.log(account, '===accoutn')
    return account;
}

// console.log(createAccount(
//     {
//         email: "Testing7@yopmail.com",
//         fullName: "TEST ACCOUNT 7",
//     }
// ))

/**
 * @description Create a new link for connect onboarding
 * @param {string} acc_id Id of stripe account to complete onboarding journey
 * @returns {object} account link object containing link to redirect
 */
export const createAccountLink = async (acc_id, type = "account_onboarding") => {
    const accountLink = await stripe.accountLinks.create({
        account: acc_id, // 'acct_1Q8eqdIqX7pxMO0a',
        refresh_url: `${process.env.FRONTEND_URL}/bank-account`, //'https://rentranzact.com',
        return_url: `${process.env.FRONTEND_URL}/bank-account`,
        type: 'account_onboarding',         // account_update for update account
        collection_options: {
            fields: 'eventually_due',
        },
    });

    console.log(accountLink, '===accountLink')

    return accountLink;

}

// console.log(createAccountLink("acct_1QHgPvIWkutNVKz6"))

/**
 * @description To transfer amount from one account to another
 * @param {string} acc_id stripe account id of benificiary
 * @param {number} amount amount to transfer
 * @param {string} currency currency of benificiary account
 * @returns {transfer} transfer object from stripe
 */
export const transferFunds = async (acc_id, amount, currency) => {
    const transfer = await stripe.transfers.create({
        amount: Number(amount) * 100,
        currency: currency.toUpperCase(),    // USD, NGN
        destination: acc_id,
    });

    console.log(transfer, '===transfer')
    return transfer;
}

// console.log(transferFunds("acct_1QINeeIod42BvpdP", 59.84, "USD"))

/**
 * @description Get current balance in stripe account
 * @param {string} acc_id Stripe account id whose balance want to get
 * @returns {balance} balance object from stripe
 */
export const getBalance = async (acc_id = null) => {
    const query = {};
    if (acc_id) {       // To fetch connected account balance, if not provided will return master account balance
        query.stripeAccount = acc_id;
    }
    const balance = await stripe.balance.retrieve(query);
    console.log(balance, '===balance')
    return balance;
}


// console.log(getBalance("acct_1Q9gmYINmaZ2kbt0"))

/**
 * 
 * @description Use this function to withdraw the balance from the account
 * @param {string} account_id stripe connected or main account id
 * @param {string} external_acc_id stripe external source id or external account id to be credited
 * @param {string} currency default currency of the account 
 * @param {number} amount amount to be withdrawl 
 * @param {string} description description to add in statements
 * @param {object} metadata meta data to receive in webhook for updating payout data in db
 * @returns { payout | object} payout object from stripe containing payout data
 */
export const payout = async (acc_id, external_acc_id, currency, amount, description = "", metadata = null) => {

    // const balance = await stripe.balance.retrieve({
    //     stripeAccount: 'acct_1Q9gmYINmaZ2kbt0',
    //   });

    //   console.log(balance, '===balance')
    //   console.log(JSON.stringify(balance), '===JSON.stringify(balance)')

    const payout = await stripe.payouts.create({
        amount: Number(amount) * 100,
        currency: currency,
        destination: external_acc_id,
        source_type: "card",
        description: description ?? "",
        metadata: metadata ?? {}
    },
        {
            stripeAccount: acc_id,
        }
    );

    console.log(payout, '===payout')
    return payout;
}

// console.log(payout("acct_1QHgPvIWkutNVKz6","ba_1QHgSKIWkutNVKz6QSR4vEee", "NGN", 1))


export const deleteAccount = async (acc_id) => {
    const deleted = await stripe.accounts.del(acc_id);
    console.log(deleted, '===deleted')
    return deleted;
}


// console.log(deleteAccount("acct_1Q8aGLRRHzUEJINV"))

// export const topUp = async () => {
//     const topup = await stripe.topups.create({
//         amount: 2000,
//         currency: 'USD',
//         description: 'Top-up for Jenny Rosen',
//         statement_descriptor: 'Top-up',
//     },
//     // {
//     //     stripeAccount: 'acct_1Q9gmYINmaZ2kbt0',
//     // }
// );

//     console.log(topup, '=====topup')
//     return topup;
// }
// console.log(topUp())


export const createPaymentMethod = async () => {
    const paymentMethod = await stripe.paymentMethods.create({
        type: 'us_bank_account',
        us_bank_account: {
            account_holder_type: 'individual',
            account_number: '000123456789',
            routing_number: '110000000',
        },
        billing_details: {
            name: 'John Doe',
        },
    });

    console.log(paymentMethod, '=====paymentMethod')
    return paymentMethod;
}

export const createBankToken = async () => {

    const token = await stripe.tokens.create({
        bank_account: {
            country: 'NG',
            currency: 'NGN',
            account_holder_name: 'Jenny Rosen',
            account_holder_type: 'individual',
            account_number: '1111111112',
            routing_number: "AAAANGLAXXX"
        },
    });

    console.log(token, '=====token');
    return token;
}

// console.log(createBankToken(), '=====createBankToken()')

export const createExternalAccount = async (acc_id, external_acc_id) => {
    const externalAccount = await stripe.accounts.createExternalAccount(
        acc_id,
        {
            external_account: external_acc_id
        }
    );

    console.log(externalAccount, '=====externalAccount');
    return externalAccount;
}

// console.log(createExternalAccount("acct_1QHgPvIWkutNVKz6", "btok_1QHhdMIqUp9zeP6EWsXvA4gr"), '=====createExternalAccount()')
