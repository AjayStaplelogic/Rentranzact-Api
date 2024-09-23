import Stripe from "stripe";
import { User } from "../models/user.model.mjs";
import { Property } from "../models/property.model.mjs";
import { RentBreakDownPer, RentType } from "../enums/property.enums.mjs";
import moment from "moment";
import { RentingHistory } from "../models/rentingHistory.model.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import { v4 as uuidv4 } from 'uuid';
import Cards from "../models/cards.model.mjs"
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import { rentApplication } from "../models/rentApplication.model.mjs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function payRentService(body, userID) {

    const { amount, propertyID, wallet, renterApplicationID, notificationID, payment_card_id } = body;

    console.log(typeof wallet, "--------wallet typeof ")

    let payload = {
        amount: amount,
        currency: 'ngn',
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            propertyID: propertyID,
            userID: userID,
            wallet: wallet,
            renterApplicationID: renterApplicationID,
            notificationID: notificationID
        }
    }

    if (payment_card_id) {
        let get_card = await Cards.findOne({
            _id: payment_card_id,
            user_id: userID
        });

        if (get_card) {
            payload.customer = get_card.customer_id;
            payload.payment_method = get_card.card_id;
        } else {
            return {
                data: {},
                message: "Invalid payment card id provided",
                status: false,
                statusCode: 400,
            }
        }
    }

    const paymentIntent = await stripe.paymentIntents.create(payload);

    return {
        data: { client_secret: paymentIntent.client_secret },
        message: "client secret created successfully",
        status: true,
        statusCode: 200,
    };




}

async function addToWallet(body, userID) {

    const { amount, wallet, payment_card_id } = body;
    let payload = {
        amount: amount,
        currency: 'ngn',
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            wallet: wallet,
            userID: userID
        }
    };
    // console.log(amount, wallet  , "=======amopunt wallet ")

    if (payment_card_id) {
        let get_card = await Cards.findOne({
            _id: payment_card_id,
            user_id: userID
        });

        if (get_card) {
            payload.customer = get_card.customer_id;
            payload.payment_method = get_card.card_id;
        } else {
            return {
                data: {},
                message: "Invalid payment card id provided",
                status: false,
                statusCode: 400,
            }
        }
    }

    const paymentIntent = await stripe.paymentIntents.create(payload);
    // console.log(paymentIntent , "=====PAYMENT INTENT  ")

    return {
        data: { client_secret: paymentIntent.client_secret },
        message: "client secret created successfully",
        status: true,
        statusCode: 200,
    };
}

async function payViaWalletService(propertyID, userID, propertyDetails, amount, landlordID, renterDetails, walletPoints, renterApplicationID) {
    const data_ = await User.findByIdAndUpdate(userID, { $inc: { walletPoints: -amount } });
    const data1 = await User.findByIdAndUpdate(landlordID, { $inc: { walletPoints: amount } })

    // const { amount, status, created, id } = body.data.object;
    const created = moment().unix();
    propertyDetails = await Property.findById(propertyID);
    if (propertyDetails) {
        let lease_end_timestamp = "";
        if (["commercial", "residential"].includes(propertyDetails.category)) {
            lease_end_timestamp = moment.unix(created).add(1, "years").unix();
        } else if (propertyDetails.category === "short stay") {
            lease_end_timestamp = moment.unix(created).add(1, "months").unix();
        }

        let newCount = propertyDetails.payment_count + 1;
        if (propertyDetails.rentType === RentType.MONTHLY) {

            const originalDate = moment.unix(created);

            const oneMonthLater = originalDate.add(1, 'months');

            const timestampOneMonthLater = oneMonthLater.unix();

            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created,
                rent_period_end: timestampOneMonthLater,
                rent_period_due: timestampOneMonthLater,
                payment_count: newCount,
                lease_end_timestamp : lease_end_timestamp
            })

            const addRenterHistory = new RentingHistory({
                pmID : propertyDetails.property_manager_id,
                renterID: userID,
                landlordID: propertyDetails.landlord_id,
                rentingType: propertyDetails.rentType,
                rentingEnd: timestampOneMonthLater,
                rentingStart: created,
                propertyID: propertyID,
                renterActive: true
            })

            addRenterHistory.save()

            // console.log(timestampOneMonthLater, "-------------timestampOneMonthLater")

        } else if (propertyDetails.rentType === RentType.QUATERLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(created);

            // Add one year to the original date
            const oneQuaterLater = originalDate.add(3, 'months');

            // Get the Unix timestamp of one year later
            const timestampOneQuaterLater = oneQuaterLater.unix();
            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created,
                rent_period_end: timestampOneQuaterLater,
                rent_period_due: timestampOneQuaterLater,
                payment_count: newCount,
                lease_end_timestamp : lease_end_timestamp
            })

            const addRenterHistory = new RentingHistory({
                pmID : propertyDetails.property_manager_id,
                renterID: userID,
                landlordID: propertyDetails.landlord_id,
                rentingType: propertyDetails.rentType,
                rentingEnd: timestampOneQuaterLater,
                rentingStart: created,
                propertyID: propertyID,
                renterActive: true
            })


            // console.log(timestampOneQuaterLater, "------------------timestampOneQuaterLater")


            addRenterHistory.save()

        } else if (propertyDetails.rentType === RentType.YEARLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(created);

            // Add one year to the original date
            const oneYearLater = originalDate.add(1, 'years');

            // Get the Unix timestamp of one year later
            const timestampOneYearLater = oneYearLater.unix();

            // console.log(timestampOneYearLater, "-----timestampOneYearLater")
            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created,
                rent_period_end: timestampOneYearLater,
                rent_period_end: timestampOneYearLater,
                rent_period_due: timestampOneYearLater,
                payment_count: newCount,
                lease_end_timestamp : lease_end_timestamp
            })

            const addRenterHistory = new RentingHistory({
                pmID : propertyDetails.property_manager_id,
                renterID: userID,
                landlordID: propertyDetails.landlord_id,
                rentingType: propertyDetails.rentType,
                rentingEnd: timestampOneYearLater,
                rentingStart: created,
                propertyID: propertyID,
                renterActive: true
            })
            addRenterHistory.save()
        }

        // Calculating rental breakdown
        let breakdown = {
            service_charge: 0,
            rent: 0,
            insurance: 0,
            agency_fee: 0,
            legal_Fee: 0,
            caution_deposite: 0,
            total_amount: 0,
            agent_fee: 0
        }

        let rent = Number(propertyDetails.rent);
        breakdown.rent = propertyDetails.rent;
        breakdown.service_charge = propertyDetails.servicesCharges;
        breakdown.agency_fee = (rent * RentBreakDownPer.AGENCY_FEE) / 100;
        breakdown.legal_Fee = (rent * RentBreakDownPer.LEGAL_FEE_PERCENT) / 100;
        breakdown.caution_deposite = (rent * RentBreakDownPer.CAUTION_FEE_PERCENT) / 100;
        breakdown.insurance = 0;    // variable declaration for future use
        breakdown.total_amount = rent + breakdown.insurance + breakdown.agency_fee + breakdown.legal_Fee + breakdown.caution_deposite;


        if (propertyDetails.property_manager_id) {
            breakdown.agent_fee = (rent * RentBreakDownPer.AGENT_FEE_PERCENT) / 100;
        }

        renterDetails = await User.findById(userID);

        const landlordDetails = await User.findById(propertyDetails.landlord_id)

        const data = new Transaction({
            wallet: true,
            renterID: userID,
            propertyID: propertyID,
            amount: amount,
            status: "success",
            date: created,
            intentID: uuidv4(),
            property: propertyDetails.propertyName,
            renter: renterDetails.fullName,
            landlord: landlordDetails.fullName,
            landlordID: landlordDetails._id,
            type: "DEBIT",
            payment_mode: "wallet",
            allCharges: breakdown
        })

        data.save()

        await rentApplication.findByIdAndUpdate(renterApplicationID, { "applicationStatus": RentApplicationStatus.COMPLETED })

    }

    return {
        data: [],
        message: "Payment Successfull",
        status: true,
        statusCode: 200,
    };
}

async function payViaWalletServiceForOld(propertyID, userID, propertyDetails, amount, landlordID, renterDetails, walletPoints, renterApplicationID) {

    const data_ = await User.findByIdAndUpdate(userID, { $inc: { walletPoints: -amount } });
    const data1 = await User.findByIdAndUpdate(landlordID, { $inc: { walletPoints: amount } })
    const created = moment().unix();
    renterDetails = await User.findById(userID)
    propertyDetails = await Property.findById(propertyID);
    const landlordDetails = await User.findById(propertyDetails.landlord_id)

    if (propertyDetails) {
        let newCount = propertyDetails.payment_count > -1 ? propertyDetails.payment_count + 1 : 1;

        if (propertyDetails.rentType === RentType.MONTHLY) {
            const originalDate = moment.unix(propertyDetails.rent_period_due);
            const oneMonthLater = originalDate.add(1, 'months');
            const timestampOneMonthLater = oneMonthLater.unix();
            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_due: timestampOneMonthLater,
                payment_count: newCount
            })

            const addRenterHistory = new RentingHistory({
                pmID : propertyDetails.property_manager_id,
                renterID: userID,
                landlordID: propertyDetails.landlord_id,
                rentingType: propertyDetails.rentType,
                rentingEnd: timestampOneMonthLater,
                propertyID: propertyID,
                renterActive: true,
                rentingStart: updateProperty.rent_period_start
            })

            addRenterHistory.save()

            // console.log(timestampOneMonthLater, "-------------timestampOneMonthLater")

        } else if (propertyDetails.rentType === RentType.QUATERLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(propertyDetails.rent_period_due);

            // Add one year to the original date
            const oneQuaterLater = originalDate.add(3, 'months');

            // Get the Unix timestamp of one year later
            const timestampOneQuaterLater = oneQuaterLater.unix();
            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                payment_count: newCount,
                rent_period_due: timestampOneQuaterLater
            })

            const addRenterHistory = new RentingHistory({
                pmID : propertyDetails.property_manager_id,
                renterID: userID,
                landlordID: propertyDetails.landlord_id,
                rentingType: propertyDetails.rentType,
                rentingEnd: timestampOneQuaterLater,
                rentingStart: updateProperty.rent_period_start,
                propertyID: propertyID,
                renterActive: true
            })

            addRenterHistory.save()

        } else if (propertyDetails.rentType === RentType.YEARLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(propertyDetails.rent_period_due);

            // Add one year to the original date
            const oneYearLater = originalDate.add(1, 'years');

            // Get the Unix timestamp of one year later
            const timestampOneYearLater = oneYearLater.unix();

            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                payment_count: newCount,
                rent_period_due: timestampOneYearLater
            })

            const addRenterHistory = new RentingHistory({
                pmID : propertyDetails.property_manager_id,
                renterID: userID,
                landlordID: propertyDetails.landlord_id,
                rentingType: propertyDetails.rentType,
                rentingEnd: timestampOneYearLater,
                rentingStart: updateProperty.rent_period_start,
                propertyID: propertyID,
                renterActive: true
            })

            addRenterHistory.save()
        }

        // Calculating rental breakdown
        let breakdown = {
            service_charge: 0,
            rent: 0,
            insurance: 0,
            agency_fee: 0,
            legal_Fee: 0,
            caution_deposite: 0,
            total_amount: 0,
            agent_fee: 0
        }

        let rent = Number(propertyDetails.rent);
        breakdown.rent = propertyDetails.rent;
        breakdown.service_charge = propertyDetails.servicesCharges;
        breakdown.agency_fee = (rent * RentBreakDownPer.AGENCY_FEE) / 100;
        breakdown.legal_Fee = (rent * RentBreakDownPer.LEGAL_FEE_PERCENT) / 100;
        breakdown.caution_deposite = (rent * RentBreakDownPer.CAUTION_FEE_PERCENT) / 100;
        breakdown.insurance = 0;    // variable declaration for future use
        breakdown.total_amount = rent + breakdown.insurance + breakdown.agency_fee + breakdown.legal_Fee + breakdown.caution_deposite;

        if (propertyDetails.property_manager_id) {
            breakdown.agent_fee = (rent * RentBreakDownPer.AGENT_FEE_PERCENT) / 100;
        }

        const data = new Transaction({
            wallet: true,
            renterID: userID,
            propertyID: propertyID,
            amount: amount,
            status: "success",
            date: created,
            intentID: uuidv4(),
            property: propertyDetails.propertyName,
            renter: renterDetails.fullName,
            landlord: landlordDetails.fullName,
            landlordID: landlordDetails._id,
            pmID: propertyDetails.property_manager_id,
            type: "DEBIT",
            payment_mode: "wallet",
            allCharges: breakdown
        })

        // await rentApplication.findByIdAndUpdate(renterApplicationID, { "applicationStatus": RentApplicationStatus.COMPLETED })
        data.save()

    }
    return {

        data: [],
        message: "success",
        status: true,
        statusCode: 200,

    }
}

export { payRentService, addToWallet, payViaWalletService, payViaWalletServiceForOld };
