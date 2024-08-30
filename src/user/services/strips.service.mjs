import Stripe from "stripe";
import { Transaction } from "../models/transactions.model.mjs";
import { Property } from "../models/property.model.mjs";
import { RentBreakDownPer, RentType } from "../enums/property.enums.mjs";
import moment from "moment";
import { User } from "../models/user.model.mjs";
import { RentingHistory } from "../models/rentingHistory.model.mjs";
import { Wallet } from "../models/wallet.model.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { rentApplication } from "../models/rentApplication.model.mjs";
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import { Notification } from "../models/notification.model.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function addStripeTransaction(body, renterApplicationID) {

    let userID;
    let propertyID;
    let notificationID;
    let amount;
    let status;
    let created;
    let id;

    if (body.paymentMethod === "stripe") {
        userID = body.data.object.metadata.userID;
        propertyID = body.data.object.metadata.propertyID;
        notificationID = body.data.object.notificationID;

        //   const { userID, propertyID, notificationID } = body.data.object.metadata;
        // const { amount, status, created, id } = body.data.object;
        amount = body.data.object.amount;
        status = body.data.object.status;
        created = body.data.object.created;
        id = body.data.object.id;


    }
    if (body.paymentMethod === "paystack") {

        userID = body.data.metadata.userID;
        propertyID = body.data.metadata.propertyID;
        notificationID = body.data.notificationID;

        //   const { userID, propertyID, notificationID } = body.data.object.metadata;
        // const { amount, status, created, id } = body.data.object;
        let createdAt = body.data.paid_at;

        amount = body.data.amount;
        status = body.data.status;
        created = moment(createdAt).unix();
        id = body.data.object.id;

    }


    await Notification.findByIdAndDelete(notificationID).then((Res) => console.log(Res, "====ress")).catch((err) => console.log(err, "===errr"))

    const propertyDetails = await Property.findById(propertyID);

    if (propertyDetails.rentType === RentType.MONTHLY) {

        let newCount = propertyDetails.payment_count + 1;

        console.log(newCount, "--new count 1")

        const originalDate = moment.unix(created.toString());

        const oneMonthLater = originalDate.add(1, 'months');

        const timestampOneMonthLater = oneMonthLater.unix();

        console.log(timestampOneMonthLater, "====TIMESTAMPE ONE MONTH LASTER")

        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created.toString(), rent_period_end: timestampOneMonthLater, rent_period_due: timestampOneMonthLater, payment_count: newCount })

        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneMonthLater, rentingStart: created.toString(), propertyID: propertyID, renterActive: true })

        addRenterHistory.save()

        // console.log(timestampOneMonthLater, "-------------timestampOneMonthLater")

    } else if (propertyDetails.rentType === RentType.QUATERLY) {
        // Convert timestamp to a Moment.js object
        let newCount = propertyDetails.payment_count + 1;
        const originalDate = moment.unix(created.toString());

        // Add one year to the original date
        const oneQuaterLater = originalDate.add(3, 'months');



        // Get the Unix timestamp of one year later
        const timestampOneQuaterLater = oneQuaterLater.unix();

        console.log(newCount, "-----new count", timestampOneQuaterLater, "----timestamppppp ")
        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created.toString(), rent_period_end: timestampOneQuaterLater, rent_period_due: timestampOneQuaterLater, payment_count: newCount })

        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneQuaterLater, rentingStart: created.toString(), propertyID: propertyID, renterActive: true })


        // console.log(timestampOneQuaterLater, "------------------timestampOneQuaterLater")


        addRenterHistory.save()

    } else if (propertyDetails.rentType === RentType.YEARLY) {
        let newCount = propertyDetails.payment_count + 1;
        // Convert timestamp to a Moment.js object
        const originalDate = moment.unix(created.toString());

        // Add one year to the original date
        const oneYearLater = originalDate.add(1, 'yearly');

        // Get the Unix timestamp of one year later
        const timestampOneYearLater = oneYearLater.unix();

        // console.log(timestampOneYearLater, "-----timestampOneYearLater")
        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created.toString(), rent_period_end: timestampOneYearLater, rent_period_due: timestampOneYearLater, payment_count: newCount })

        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneYearLater, rentingStart: created.toString(), propertyID: propertyID, renterActive: true })
        addRenterHistory.save()
    }

    const renterDetails = await User.findById(userID);

    const landlordDetails = await User.findById(propertyDetails.landlord_id)

    async function rentalBreakdown(propertyID) {

        const property = await Property.findById(propertyID);

        const data = {
            service_charge: 0,
            rent: 0,
            insurance: 0,
            agency_fee: 0,
            legal_Fee: 0,
            caution_deposite: 0,
            total_amount: 0,
            agent_fee: 0
        }

        let rent = Number(property.rent);
        data.rent = property.rent;
        data.service_charge = property.servicesCharges;
        data.agency_fee = (rent * RentBreakDownPer.AGENCY_FEE) / 100;
        data.legal_Fee = (rent * RentBreakDownPer.LEGAL_FEE_PERCENT) / 100;
        data.caution_deposite = (rent * RentBreakDownPer.CAUTION_FEE_PERCENT) / 100;
        data.insurance = 0;    // variable declaration for future use
        data.total_amount = rent + data.insurance + data.agency_fee + data.legal_Fee + data.caution_deposite;


        if (property.property_manager_id) {
            data.agent_fee = (rent * RentBreakDownPer.AGENT_FEE_PERCENT) / 100;
        }

        return data
    }

    let breakdown = await rentalBreakdown(propertyID)

    const data = new Transaction({ wallet: false, renterID: userID, propertyID: propertyID, amount: amount, status: status, date: created.toString(), intentID: id, property: propertyDetails.propertyName, renter: renterDetails.fullName, landlord: landlordDetails.fullName, landlordID: landlordDetails._id, pmID: propertyDetails.property_manager_id, type: "DEBIT", payment_mode: "stripe", allCharges: breakdown })

    await rentApplication.findByIdAndUpdate(renterApplicationID, { "applicationStatus": RentApplicationStatus.COMPLETED })

    data.save()




    return {

        data: [],
        message: "success",
        status: true,
        statusCode: 200,

    }

}

async function rechargeWallet(body) {

    let userID;

    if (body.paymentMethod === "stripe") {
        userID = body.data.object.metadata.userID;
    }

    if (body.paymentMethod === "paystack") {
        userID = body.data.metadata.userID;
    }

    const userDetail = await User.findById(userID);

    let payload = {}

    if (userDetail.role === UserRoles.RENTER) {

        if (body.paymentMethod === "stripe") {
            const { amount, status, created, id } = body.data.object;
            payload = {
                amount,
                status,
                createdAt: created,
                type: "CREDIT",
                userID,
                intentID: id
            }

            const data_ = new Transaction({ wallet: true, renterID: userID, amount: amount, status: status, date: created, intentID: id, type: "CREDIT", payment_mode: body.paymentMethod })

            data_.save()
            if (status === "succeeded") {

                const data__ = await User.findByIdAndUpdate(
                    userID,
                    { $inc: { walletPoints: amount } },
                    { new: true }
                );

            }


        } else if (body.paymentMethod === "paystack") {

            const amount = body.data.amount;
            const status = body.data.status;
            const createdAt = body.data.paid_at;
            const created = moment(createdAt).unix();
            const id = body.data.id;

            payload = {
                amount,
                status,
                createdAt: created.toString(),
                type: "CREDIT",
                userID,
                intentID: id
            }

            const data_ = new Transaction({ wallet: true, renterID: userID, amount: amount, status: status, date: created, intentID: id, type: "CREDIT", payment_mode: body.paymentMethod })

            data_.save()
            if (status === "success") {

                const data__ = await User.findByIdAndUpdate(
                    userID,
                    { $inc: { walletPoints: amount } },
                    { new: true }
                );

            }


        }

    } else if (userDetail.role === UserRoles.LANDLORD) {
        // payload = {
        //     amount,
        //     status,
        //     createdAt: created,
        //     type: "CREDIT",
        //     landlordID: userID,
        //     intentID: id
        // }

    }

    // const data = new Wallet(payload)
    // data.save()

    // const data_ = new Transaction({ wallet: true, renterID: userID, amount: amount, status: status, date: created, intentID: id, type: "CREDIT", payment_mode: body.paymentMethod })
    // data_.save()

    return {

        data: [],
        message: "success",
        status: true,
        statusCode: 200,

    }
}

async function addStripeTransactionForOld(body, renterApplicationID) {

    let userID;
    let propertyID;
    let notificationID;
    let amount;
    let status;
    let created;
    let id;

    if (body.paymentMethod === "stripe") {
        userID = body.data.object.metadata.userID;
        propertyID = body.data.object.metadata.propertyID;
        notificationID = body.data.object.notificationID;

        //   const { userID, propertyID, notificationID } = body.data.object.metadata;
        // const { amount, status, created, id } = body.data.object;
        amount = body.data.object.amount;
        status = body.data.object.status;
        created = body.data.object.created;
        id = body.data.object.id;


    }
    if (body.paymentMethod === "paystack") {

        userID = body.data.metadata.userID;
        propertyID = body.data.metadata.propertyID;
        notificationID = body.data.notificationID;

        //   const { userID, propertyID, notificationID } = body.data.object.metadata;
        // const { amount, status, created, id } = body.data.object;
        let createdAt = body.data.paid_at;

        amount = body.data.amount;
        status = body.data.status;
        created = moment(createdAt).unix();
        id = body.data.object.id;

    }




    // const { userID, propertyID, notificationID } = body.data.object.metadata;
    // await Notification.findByIdAndDelete(notificationID);

    // const { amount, status, created, id } = body.data.object;

    const propertyDetails = await Property.findById(propertyID);

    console.log(propertyDetails, "=====peroperty detailsss")

    if (propertyDetails.rentType === RentType.MONTHLY) {

        console.log(propertyDetails.payment_count, "------------> payment count");

        console.log(propertyDetails.rent_period_due, "------------> payment rent paid due");

        const originalDate = moment.unix(propertyDetails.rent_period_due);

        console.log(originalDate, "------------> originalDate");

        const oneMonthLater = originalDate.add(1, 'months');

        console.log(oneMonthLater, "------------> oneMonthLater");

        const timestampOneMonthLater = oneMonthLater.unix();

        console.log(timestampOneMonthLater, "------------> timestampOneMonthLater");

        let newCount = propertyDetails.payment_count + 1;

        console.log(newCount, "------------> newCount");

        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_due: timestampOneMonthLater, payment_count: newCount })

        console.log(updateProperty, "---------------> updateProperty")

        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, propertyID: propertyID, renterActive: true, rentingStart: updateProperty.rent_period_start })

        addRenterHistory.save()

        // console.log(timestampOneMonthLater, "-------------timestampOneMonthLater")

    } else if (propertyDetails.rentType === RentType.QUATERLY) {
        // Convert timestamp to a Moment.js object
        const originalDate = moment.unix(propertyDetails.rent_period_due);

        // Add one year to the original date
        const oneQuaterLater = originalDate.add(3, 'months');

        // Get the Unix timestamp of one year later
        const timestampOneQuaterLater = oneQuaterLater.unix();


        let newCount = propertyDetails.payment_count + 1;

        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, payment_count: newCount, rent_period_due: timestampOneQuaterLater })

        console.log(updateProperty, "======updarteeeee")
        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneQuaterLater, rentingStart: updateProperty.rent_period_start, propertyID: propertyID, renterActive: true })


        console.log(timestampOneQuaterLater, "------------------timestampOneQuaterLater")


        addRenterHistory.save()

    } else if (propertyDetails.rentType === RentType.YEARLY) {
        console.log(propertyDetails.rent_period_due, '=========propertyDetails.rent_period_due')
        // Convert timestamp to a Moment.js object
        const originalDate = moment.unix(propertyDetails.rent_period_due);
        console.log(originalDate, '=========originalDate')

        // Add one year to the original date
        const oneYearLater = originalDate.add(1, 'years');
        console.log(oneYearLater, '=========oneYearLater')


        // Get the Unix timestamp of one year later
        const timestampOneYearLater = oneYearLater.unix();

        let newCount = propertyDetails.payment_count + 1;

        console.log(timestampOneYearLater, "-----timestampOneYearLater")
        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, payment_count: newCount, rent_period_due: timestampOneYearLater })

        console.log(updateProperty, "======updarteeeee Yearly")
        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneYearLater, rentingStart: updateProperty.rent_period_start, propertyID: propertyID, renterActive: true })
        addRenterHistory.save()
    }

    const renterDetails = await User.findById(userID);

    const landlordDetails = await User.findById(propertyDetails.landlord_id)

    async function rentalBreakdown(propertyID) {

        const property = await Property.findById(propertyID);

        const data = {
            service_charge: 0,
            rent: 0,
            insurance: 0,
            agency_fee: 0,
            legal_Fee: 0,
            caution_deposite: 0,
            total_amount: 0,
            agent_fee: 0
        }

        let rent = Number(property.rent);
        data.rent = property.rent;
        data.service_charge = property.servicesCharges;
        data.agency_fee = (rent * RentBreakDownPer.AGENCY_FEE) / 100;
        data.legal_Fee = (rent * RentBreakDownPer.LEGAL_FEE_PERCENT) / 100;
        data.caution_deposite = (rent * RentBreakDownPer.CAUTION_FEE_PERCENT) / 100;
        data.insurance = 0;    // variable declaration for future use
        data.total_amount = rent + data.insurance + data.agency_fee + data.legal_Fee + data.caution_deposite;


        if (property.property_manager_id) {
            data.agent_fee = (rent * RentBreakDownPer.AGENT_FEE_PERCENT) / 100;
        }

        return data
    }

    let breakdown = await rentalBreakdown(propertyID)

    const data = new Transaction({ wallet: false, renterID: userID, propertyID: propertyID, amount: amount, status: status, date: created.toString(), intentID: id, property: propertyDetails.propertyName, renter: renterDetails.fullName, landlord: landlordDetails.fullName, landlordID: landlordDetails._id, pmID: propertyDetails.property_manager_id, type: "DEBIT", payment_mode: "stripe", allCharges: breakdown })

    // await rentApplication.findByIdAndUpdate(renterApplicationID, { "applicationStatus": RentApplicationStatus.COMPLETED })

    data.save()




    return {

        data: [],
        message: "success",
        status: true,
        statusCode: 200,

    }
}

export { addStripeTransaction, rechargeWallet, addStripeTransactionForOld };
