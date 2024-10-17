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
import * as commissionServices from "../services/commission.service.mjs";
import { EPaymentType } from "../enums/wallet.enum.mjs";
import { ETRANSACTION_TYPE } from "../enums/common.mjs";
import * as referralService from "../services/referral.service.mjs";
import * as TransferServices from "../services/transfer.service.mjs";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function addStripeTransaction(body, renterApplicationID) {

    let userID;
    let propertyID;
    let notificationID;
    let amount;
    let status;
    let created;
    let id;

    // console.log(body.paymentMethod, "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx paymentMethod")
    console.log(body, "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXBODY")
    // console.log(body.data.object.metadata, "---------------meta")

    if (body.paymentMethod === "stripe") {
        userID = body.data.object.metadata.userID;
        propertyID = body.data.object.metadata.propertyID;
        notificationID = body.data.object.metadata.notificationID;

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
        id = body?.data?.id;

    }
    console.log(notificationID, "xxxxxxxxxxxxxxxxxxxxxxxNotification ID")

    // await Notification.findByIdAndDelete(notificationID).then((Res) => console.log(Res, "====ress")).catch((err) => console.log(err, "===errr"))


    const propertyDetails = await Property.findById(propertyID);
    if (propertyDetails) {
        let lease_end_timestamp = "";
        if (["commercial", "residential"].includes(propertyDetails.category)) {
            lease_end_timestamp = moment.unix(created).add(1, "years").unix();
        } else if (propertyDetails.category === "short stay") {
            lease_end_timestamp = moment.unix(created).add(1, "months").unix();
        }

        if (propertyDetails.rentType === RentType.MONTHLY) {

            let newCount = propertyDetails.payment_count + 1;


            console.log(newCount, "--new count 1")

            const originalDate = moment.unix(created.toString());


            const oneMonthLater = originalDate.add(1, 'months');

            const timestampOneMonthLater = oneMonthLater.unix();


            console.log(timestampOneMonthLater, "====TIMESTAMPE ONE MONTH LASTER")

            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created.toString(),
                rent_period_end: timestampOneMonthLater,
                rent_period_due: timestampOneMonthLater,
                payment_count: newCount,
                lease_end_timestamp: lease_end_timestamp,
                inDemand: false        // setting this to false because when property is rented then should remove from in demand
            })

            const addRenterHistory = new RentingHistory({
                pmID: propertyDetails?.property_manager_id,
                renterID: userID,
                landlordID: propertyDetails?.landlord_id,
                rentingType: propertyDetails?.rentType,
                rentingEnd: timestampOneMonthLater,
                rentingStart: created.toString(),
                propertyID: propertyID,
                renterActive: true
            })


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
            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created.toString(),
                rent_period_end: timestampOneQuaterLater,
                rent_period_due: timestampOneQuaterLater,
                payment_count: newCount,
                lease_end_timestamp: lease_end_timestamp,
                inDemand: false        // setting this to false because when property is rented then should remove from in demand
            })

            const addRenterHistory = new RentingHistory({
                pmID: propertyDetails?.property_manager_id,
                renterID: userID,
                landlordID: propertyDetails?.landlord_id,
                rentingType: propertyDetails?.rentType,
                rentingEnd: timestampOneQuaterLater,
                rentingStart: created.toString(),
                propertyID: propertyID,
                renterActive: true,
            })



            // console.log(timestampOneQuaterLater, "------------------timestampOneQuaterLater")


            addRenterHistory.save()


        } else if (propertyDetails.rentType === RentType.YEARLY) {
            let newCount = propertyDetails.payment_count + 1;
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(created.toString());


            // Add one year to the original date
            const oneYearLater = originalDate.add(1, 'years');

            // Get the Unix timestamp of one year later
            const timestampOneYearLater = oneYearLater.unix();


            // console.log(timestampOneYearLater, "-----timestampOneYearLater")
            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created.toString(),
                rent_period_end: timestampOneYearLater,
                rent_period_due: timestampOneYearLater,
                payment_count: newCount,
                lease_end_timestamp: lease_end_timestamp,
                inDemand: false        // setting this to false because when property is rented then should remove from in demand
            })

            const addRenterHistory = new RentingHistory({
                pmID: propertyDetails?.property_manager_id,
                renterID: userID,
                landlordID: propertyDetails?.landlord_id,
                rentingType: propertyDetails?.rentType,
                rentingEnd: timestampOneYearLater,
                rentingStart: created.toString(),
                propertyID: propertyID,
                renterActive: true
            })
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
                agent_fee: 0,
                rtz_fee: 0
            }

            let rent = Number(property.rent);
            data.rent = property.rent;
            data.service_charge = property.servicesCharges;
            data.agency_fee = (rent * RentBreakDownPer.AGENCY_FEE) / 100;
            data.legal_Fee = (rent * RentBreakDownPer.LEGAL_FEE_PERCENT) / 100;
            data.caution_deposite = (rent * RentBreakDownPer.CAUTION_FEE_PERCENT) / 100;
            data.insurance = 0;    // variable declaration for future use
            data.rtz_fee = (rent * RentBreakDownPer.RTZ_FEE_PERCENT) / 100;
            data.total_amount = rent + data.insurance + data.agency_fee + data.legal_Fee + data.caution_deposite;


            if (property.property_manager_id) {
                data.agent_fee = (rent * RentBreakDownPer.AGENT_FEE_PERCENT) / 100;
            }

            return data
        }

        let breakdown = await rentalBreakdown(propertyID)


        const data = new Transaction({
            wallet: false,
            renterID: userID,
            propertyID: propertyID,
            amount: amount,
            status: status,
            date: created.toString(),
            intentID: id,
            property: propertyDetails.propertyName,
            renter: renterDetails.fullName,
            landlord: landlordDetails?.fullName,
            landlordID: landlordDetails?._id,
            pmID: propertyDetails?.property_manager_id,
            type: "DEBIT",
            payment_mode: "stripe",
            allCharges: breakdown,
            transaction_type: ETRANSACTION_TYPE.rentPayment
        })


        await rentApplication.findByIdAndUpdate(renterApplicationID, { "applicationStatus": RentApplicationStatus.COMPLETED })

        // Adding commission for property manager
        if (propertyDetails.property_manager_id && propertyDetails.landlord_id) {       // If property owner is landlord
            await commissionServices.rentCommissionToPM(propertyDetails, null, propertyDetails.rent);
        }
        data.save()

        // If landlord have referral code then transfering referral bonus to their parent or referrer
        if (landlordDetails?.referralCode) {
            const payTo = await referralService.getUserByMyCode(landlordDetails.referralCode); // amount to be transferred to
            if (payTo) {
                const referralAmount = await referralService.calculateReferralAmountWithRTZFee(breakdown.rtz_fee);
                if (referralAmount > 0) {
                    await referralService.addReferralBonusInWallet(referralAmount, landlordDetails?._id, payTo._id, propertyDetails._id);
                }
            }
        }

        // Deleting notification which was showing pay now button after payment successfull
        if (notificationID) {
            await Notification.findByIdAndDelete(notificationID)
        }


        // Requesting Admin for transfer admin account to landlord account
        if (propertyDetails?.landlord_id) {
            TransferServices.makeTransferForPropertyRent(propertyDetails, null, amount);
        }
        return {
            data: [],
            message: "success",
            status: true,
            statusCode: 200,

        }

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

    if (userDetail) {
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

            let transaction_payload = {
                wallet: true,
                amount: amount,
                status: status,
                date: created,
                intentID: id,
                type: "CREDIT",
                payment_mode: body.paymentMethod,
                transaction_type: ETRANSACTION_TYPE.rechargeWallet
            };

            if (UserRoles.LANDLORD === userDetail?.role) {
                transaction_payload.landlordID = userDetail._id;
            } else if (UserRoles.PROPERTY_MANAGER === userDetail?.role) {
                transaction_payload.pmID = userDetail._id;
            } else if (UserRoles.RENTER === userDetail?.role) {
                transaction_payload.renterID = userDetail._id;
            }
            const data_ = new Transaction(transaction_payload)

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
            const id = body?.data?.id;

            payload = {
                amount,
                status,
                createdAt: created.toString(),
                type: "CREDIT",
                userID,
                intentID: id
            }

            const transaction_payload = {
                wallet: true,
                amount: amount,
                status: status,
                date: created,
                intentID: id,
                type: "CREDIT",
                payment_mode: body.paymentMethod,
                transaction_type: ETRANSACTION_TYPE.rechargeWallet
            }

            if (UserRoles.LANDLORD === userDetail?.role) {
                transaction_payload.landlordID = userDetail._id;
            } else if (UserRoles.PROPERTY_MANAGER === userDetail?.role) {
                transaction_payload.pmID = userDetail._id;
            } else if (UserRoles.RENTER === userDetail?.role) {
                transaction_payload.renterID = userDetail._id;
            }
            const data_ = new Transaction(transaction_payload)

            data_.save()
            if (status === "success") {

                const data__ = await User.findByIdAndUpdate(
                    userID,
                    { $inc: { walletPoints: amount } },
                    { new: true }
                );
            }
        }

        console.log("payload=----", payload, '====payload')
        if (Object.keys(payload).length > 0) {
            payload.payment_type = EPaymentType.rechargeWallet
            let add_wallet = await Wallet.create(payload);
            console.log("add_wallet=----", add_wallet, '====add_wallet')

        }
    }

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
        id = body.data.id;

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


        const updateProperty = await Property.findByIdAndUpdate(propertyID, {
            rented: true,
            renterID: userID,
            rent_period_due: timestampOneMonthLater,
            payment_count: newCount,
            inDemand: false        // setting this to false because when property is rented then should remove from in demand
        })

        console.log(updateProperty, "---------------> updateProperty")

        const addRenterHistory = new RentingHistory({
            pmID: propertyDetails?.property_manager_id,
            renterID: userID,
            landlordID: propertyDetails?.landlord_id,
            rentingType: propertyDetails?.rentType,
            propertyID: propertyID,
            renterActive: true,
            rentingStart: updateProperty?.rent_period_start
        });


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


        const updateProperty = await Property.findByIdAndUpdate(propertyID, {
            rented: true,
            renterID: userID,
            payment_count: newCount,
            rent_period_due: timestampOneQuaterLater,
            inDemand: false        // setting this to false because when property is rented then should remove from in demand
        })

        console.log(updateProperty, "======updarteeeee")
        const addRenterHistory = new RentingHistory({
            pmID: propertyDetails?.property_manager_id,
            renterID: userID,
            landlordID: propertyDetails?.landlord_id,
            rentingType: propertyDetails?.rentType,
            rentingEnd: timestampOneQuaterLater,
            rentingStart: updateProperty?.rent_period_start,
            propertyID: propertyID,
            renterActive: true
        })



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

        const updateProperty = await Property.findByIdAndUpdate(propertyID, {
            rented: true,
            renterID: userID,
            payment_count: newCount,
            rent_period_due: timestampOneYearLater,
            inDemand: false        // setting this to false because when property is rented then should remove from in demand
        })

        console.log(updateProperty, "======updarteeeee Yearly")
        const addRenterHistory = new RentingHistory({
            pmID: propertyDetails?.property_manager_id,
            renterID: userID,
            landlordID: propertyDetails?.landlord_id,
            rentingType: propertyDetails?.rentType,
            rentingEnd: timestampOneYearLater,
            rentingStart: updateProperty?.rent_period_start,
            propertyID: propertyID,
            renterActive: true
        })

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


    const data = new Transaction({
        wallet: false,
        renterID: userID,
        propertyID: propertyID,
        amount: amount,
        status: status,
        date: created.toString(),
        intentID: id,
        property: propertyDetails?.propertyName,
        renter: renterDetails?.fullName,
        landlord: landlordDetails?.fullName,
        landlordID: landlordDetails?._id,
        pmID: propertyDetails?.property_manager_id,
        type: "DEBIT",
        payment_mode: "stripe",
        allCharges: breakdown,
        transaction_type: ETRANSACTION_TYPE.rentPayment
    })


    // await rentApplication.findByIdAndUpdate(renterApplicationID, { "applicationStatus": RentApplicationStatus.COMPLETED })

    // Adding commission for property manager
    if (propertyDetails.property_manager_id && propertyDetails.landlord_id) {       // If property owner is landlord
        await commissionServices.rentCommissionToPM(propertyDetails, null, propertyDetails.rent);
    }
    data.save()
    if (notificationID) {
        await Notification.findByIdAndDelete(notificationID)
    }

    // Requesting Admin for transfer admin account to landlord account
    if (propertyDetails?.landlord_id) {
        TransferServices.makeTransferForPropertyRent(propertyDetails, null, amount);
    }
    
    return {
        data: [],
        message: "success",
        status: true,
        statusCode: 200,

    }
}

export { addStripeTransaction, rechargeWallet, addStripeTransactionForOld };
