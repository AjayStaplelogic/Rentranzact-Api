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
        settings: {
            payouts: {
                schedule: {
                    interval: "manual"
                }
            }
        },
        metadata: {
            user_id: user._id,
        },
    });
    console.log(account, '===accoutn')
    return account;
}

// console.log(createAccount(
//     {
//         email: "test6@yopmail.com",
//         fullName: "TEST ACCOUNT 6",
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
        refresh_url: 'https://rentranzact.com',
        return_url: 'https://rentranzact.com',
        type: 'account_onboarding',         // account_update for update account
        collection_options: {
            fields: 'eventually_due',
        },
    });

    console.log(accountLink, '===accountLink')

    return accountLink;

}

// console.log(createAccountLink("acct_1Q9gceI8UDBBc9bA"))


export const transferFunds = async (acc_id) => {
    const transfer = await stripe.transfers.create({
        amount: 1 * 100,
        currency: 'NGN',
        destination: acc_id,
    });

    console.log(transfer, '===transfer')
    return transfer;
}

// console.log(transferFunds("acct_1Q9gmYINmaZ2kbt0"))

export const getBalance = async () => {
    const balance = await stripe.balance.retrieve();
    console.log(balance, '===balance')
    return balance;
}


// console.log(getBalance("acct_1Q8eqdIqX7pxMO0a"))

export const payout = async (external_acc_id) => {

    // const balance = await stripe.balance.retrieve({
    //     stripeAccount: 'acct_1Q9gmYINmaZ2kbt0',
    //   });

    //   console.log(balance, '===balance')
    //   console.log(JSON.stringify(balance), '===JSON.stringify(balance)')



    const payout = await stripe.payouts.create({
        amount: 1 * 100,
        currency: 'NGN',
        destination: external_acc_id,
        source_type: "card"
    },
        {
            stripeAccount: 'acct_1Q9gmYINmaZ2kbt0',
        }
    );

    console.log(payout, '===payout')
    return payout;
}

// console.log(payout("ba_1Q9govINmaZ2kbt0sOtCObcc"))


export const deleteAccount = async (acc_id) => {
    const deleted = await stripe.accounts.del(acc_id);
    console.log(deleted, '===deleted')
    return deleted;
}


// console.log(deleteAccount("acct_1Q8aGLRRHzUEJINV"))


