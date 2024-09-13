import { RentBreakDownPer, RentType } from "../enums/property.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import { RentingHistory } from "../models/rentingHistory.model.mjs";
import moment from "moment";
import { User } from "../models/user.model.mjs";
import { rentApplication } from "../models/rentApplication.model.mjs";
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import { Wallet } from "../models/wallet.model.mjs";

async function addFlutterwaveTransaction(body, renterApplicationID) {

    const { status, amount, createdAt, id, meta_data } = body;

    const momentObject = moment(createdAt);
    // Get the timestamp (milliseconds since the Unix epoch)
    const created = momentObject.unix();

    const { wallet, propertyID, userID } = meta_data;

    const renterDetails = await User.findById(userID)

    const propertyDetails = await Property.findById(propertyID);

    const landlordDetails = await User.findById(propertyDetails.landlord_id);

    if (propertyDetails) {
        let lease_end_timestamp = "";
        if (["commercial", "residential"].includes(propertyDetails.category)) {
            lease_end_timestamp = moment.unix(created).add(1, "years").unix();
        } else if (propertyDetails.category === "short stay") {
            lease_end_timestamp = moment.unix(created).add(1, "months").unix();
        }

        let newCount = propertyDetails.payment_count > -1 ? propertyDetails.payment_count + 1 : 1;

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
                lease_end_timestamp: lease_end_timestamp
            })

            const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneMonthLater, rentingStart: created, propertyID: propertyID, renterActive: true })

            addRenterHistory.save()

            console.log(timestampOneMonthLater, "-------------timestampOneMonthLater")

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
                lease_end_timestamp: lease_end_timestamp,
            })

            const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneQuaterLater, rentingStart: created, propertyID: propertyID, renterActive: true })


            console.log(timestampOneQuaterLater, "------------------timestampOneQuaterLater")


            addRenterHistory.save()

        } else if (propertyDetails.rentType === RentType.YEARLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(created);

            // Add one year to the original date
            const oneYearLater = originalDate.add(1, 'years');

            // Get the Unix timestamp of one year later
            const timestampOneYearLater = oneYearLater.unix();

            console.log(timestampOneYearLater, "-----timestampOneYearLater")
            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created,
                rent_period_end: timestampOneYearLater,
                rent_period_due: timestampOneYearLater,
                payment_count: newCount,
                lease_end_timestamp: lease_end_timestamp
            })

            const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneYearLater, rentingStart: created, propertyID, renterActive: true })
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

        // Saving transaction record in DB
        const changePayload = {
            wallet: false,
            renterID: userID,
            propertyID: propertyID,
            amount: amount,
            status: status,
            date: created,
            intentID: id,
            property: propertyDetails.propertyName,
            renter: renterDetails.fullName,
            pmID: propertyDetails.property_manager_id,
            type: "Debit",
            payment_mode: "flutterwave",
            allCharges: breakdown
        }

        if (landlordDetails) {
            changePayload.landlord = landlordDetails.fullName;
            changePayload.landlordID = landlordDetails._id;
        }


        const data = new Transaction(changePayload)
        await rentApplication.findByIdAndUpdate(renterApplicationID, { "applicationStatus": RentApplicationStatus.COMPLETED })
        data.save()
    }

    return {
        data: [],
        message: "dashboard stats",
        status: true,
        statusCode: 200,
    };

}

async function addToWallet(body) {
    let { amount, status, createdAt, id } = body;
    let { userID } = body.meta_data;
    const created = moment(createdAt).unix();
    if (status === "successful") {
        let userDetail = await User.findById(userID);
        if (userDetail) {
            let payload = {
                amount,
                status,
                createdAt: created,
                type: "CREDIT",
                userID,
                intentID: id
            }

            let add_wallet = await Wallet.create(payload);
            if (add_wallet) {
                let update_user = await User.findByIdAndUpdate(userID, {
                    $inc: { walletPoints: amount }
                });

                let create_transaction = await Transaction.create({
                    wallet: true,
                    renterID: userID,
                    amount: amount,
                    status: status,
                    date: created,
                    intentID: id,
                    type: "CREDIT",
                    payment_mode: "flutterwave"
                });
            }
        }
    }
}

async function addFlutterwaveTransactionForOld(body) {

    const { status, amount, createdAt, id, meta_data } = body;

    const momentObject = moment(createdAt);

    // Get the timestamp (milliseconds since the Unix epoch)
    const created = momentObject.unix();

    const { propertyID, userID } = meta_data;

    const renterDetails = await User.findById(userID)

    const propertyDetails = await Property.findById(propertyID);

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
                renterID: userID,
                landlordID: propertyDetails.landlord_id,
                rentingType: propertyDetails.rentType,
                rentingEnd: timestampOneMonthLater,
                propertyID: propertyID,
                renterActive: true,
                rentingStart: updateProperty.rent_period_start,
            })

            addRenterHistory.save()


            console.log(timestampOneMonthLater, "-------------timestampOneMonthLater")

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
                renterID: userID,
                landlordID: propertyDetails.landlord_id,
                rentingType: propertyDetails.rentType,
                rentingEnd: timestampOneQuaterLater,
                rentingStart: updateProperty.rent_period_start,
                propertyID: propertyID,
                renterActive: true
            })


            console.log(timestampOneQuaterLater, "------------------timestampOneQuaterLater")


            addRenterHistory.save()

        } else if (propertyDetails.rentType === RentType.YEARLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(propertyDetails.rent_period_due);

            // Add one year to the original date
            const oneYearLater = originalDate.add(1, 'years');

            // Get the Unix timestamp of one year later
            const timestampOneYearLater = oneYearLater.unix();

            console.log(timestampOneYearLater, "-----timestampOneYearLater")
            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                payment_count: newCount,
                rent_period_due: timestampOneYearLater,
            })

            const addRenterHistory = new RentingHistory({
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
        // Saving transaction record in DB
        const changePayload = {
            wallet: false,
            renterID: userID,
            propertyID: propertyID,
            amount: amount,
            status: status,
            date: created,
            intentID: id,
            property: propertyDetails.propertyName,
            renter: renterDetails.fullName,
            pmID: propertyDetails.property_manager_id,
            type: "Debit",
            payment_mode: "flutterwave",
            allCharges: breakdown
        }

        if (landlordDetails) {
            changePayload.landlord = landlordDetails.fullName;
            changePayload.landlordID = landlordDetails._id;
        }

        const data = new Transaction(changePayload)
        // await rentApplication.findByIdAndUpdate(renterApplicationID, { "applicationStatus": RentApplicationStatus.COMPLETED })
        data.save()
    }

    return {
        data: [],
        message: "dashboard stats",
        status: true,
        statusCode: 200,
    };

}

export { addFlutterwaveTransaction, addToWallet, addFlutterwaveTransactionForOld };
