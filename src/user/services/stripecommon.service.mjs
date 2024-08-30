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