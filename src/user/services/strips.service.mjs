import Stripe from "stripe";
import { Transaction } from "../models/transactions.model.mjs";
import { Property } from "../models/property.model.mjs";
import { RentType } from "../enums/property.enums.mjs";
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
import * as PropertyServices from "../services/property.service.mjs";
import * as TransactionServices from "../../user/services/transaction.service.mjs";
import { rentPaidEmailToRenter } from "../emails/rent.emails.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function addStripeTransaction(body, renterApplicationID) {
    console.log("FIRST STRIPE TRANSACTION")
    let userID;
    let propertyID;
    let notificationID;
    let amount;
    let status;
    let created;
    let id;

    console.log(body, '===================body 222222222')

    if (body.paymentMethod === "stripe") {
        userID = body.data.object.metadata.userID;
        propertyID = body.data.object.metadata.propertyID;
        notificationID = body.data.object.metadata.notificationID;
        amount = Number(body.data.object.amount / 100);
        status = body.data.object.status;
        created = body.data.object.created;
        id = body.data.object.id;
    }

    if (body.paymentMethod === "paystack") {
        userID = body.data.metadata.userID;
        propertyID = body.data.metadata.propertyID;
        notificationID = body.data.metadata.notificationID;
        let createdAt = body.data.paid_at;

        amount = Number(body.data.amount / 100);
        status = body.data.status;
        created = moment(createdAt).unix();
        id = body?.data?.id;
    }

    console.log(created, '===================created')
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
            console.log(created, '==================created 2222222222')
            const originalDate = moment.unix(created.toString());
            const oneMonthLater = originalDate.add(1, 'months');
            const timestampOneMonthLater = oneMonthLater.unix();
            console.log(created, '==================created 3333333333333')

            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created.toString(),
                rent_period_end: timestampOneMonthLater,
                rent_period_due: timestampOneMonthLater,
                payment_count: newCount,
                lease_end_timestamp: lease_end_timestamp,
                inDemand: false,        // setting this to false because when property is rented then should remove from in demand
                next_payment_at: new Date(Number(timestampOneMonthLater) * 1000),
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
            console.log(addRenterHistory, '==================addRenterHistory')

        } else if (propertyDetails.rentType === RentType.QUATERLY) {
            // Convert timestamp to a Moment.js object
            let newCount = propertyDetails.payment_count + 1;
            const originalDate = moment.unix(created.toString());
            // Add one year to the original date
            const oneQuaterLater = originalDate.add(3, 'months');
            // Get the Unix timestamp of one year later
            const timestampOneQuaterLater = oneQuaterLater.unix();
            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created.toString(),
                rent_period_end: timestampOneQuaterLater,
                rent_period_due: timestampOneQuaterLater,
                payment_count: newCount,
                lease_end_timestamp: lease_end_timestamp,
                inDemand: false,        // setting this to false because when property is rented then should remove from in demand
                next_payment_at: new Date(Number(timestampOneQuaterLater) * 1000),
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

            addRenterHistory.save()
        } else if (propertyDetails.rentType === RentType.YEARLY) {
            let newCount = propertyDetails.payment_count + 1;
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(created.toString());

            // Add one year to the original date
            const oneYearLater = originalDate.add(1, 'years');

            // Get the Unix timestamp of one year later
            const timestampOneYearLater = oneYearLater.unix();

            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created.toString(),
                rent_period_end: timestampOneYearLater,
                rent_period_due: timestampOneYearLater,
                payment_count: newCount,
                lease_end_timestamp: lease_end_timestamp,
                inDemand: false,        // setting this to false because when property is rented then should remove from in demand
                next_payment_at: new Date(Number(timestampOneYearLater) * 1000),
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
        let breakdown = PropertyServices.getRentalBreakUp(propertyDetails);
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
        if (propertyDetails.property_manager_id) {       // If property owner is landlord
            if (propertyDetails.landlord_id) {
                await commissionServices.rentCommissionToPM(propertyDetails, null, propertyDetails.rent);
            }

            // Sending email to property manager about successful rent payment
            TransactionServices.sendRentPaymentNotificationAndEmail({
                property: propertyDetails,
                renter_details: renterDetails,
                send_to: propertyDetails?.property_manager_id,
                amount: amount
            });
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
            TransferServices.makeTransferForPropertyRent(propertyDetails, null, breakdown.landlord_earning);

            // Sending email to landlord about successful rent payment
            TransactionServices.sendRentPaymentNotificationAndEmail({
                property: propertyDetails,
                renter_details: renterDetails,
                send_to: propertyDetails?.landlord_id,
                amount: amount
            });
        }

        // Sending email to renter about successful rent payment
        if (data?._id) {
            rentPaidEmailToRenter({
                email: renterDetails?.email,
                amount: amount,
                property_name: propertyDetails.propertyName,
                renter_name: renterDetails?.fullName,
                transaction_id: data._id
            });
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
    let transfer_amount = 0;
    if (body.paymentMethod === "stripe") {
        userID = body.data.object.metadata.userID;
        transfer_amount = Number(body?.data?.object?.amount / 100);
    }

    if (body.paymentMethod === "paystack") {
        userID = body.data.metadata.userID;
        transfer_amount = Number(body?.data?.amount / 100)
    }

    User.findById(userID).then(async (userDetail) => {
        let payload = {}
        if (userDetail) {
            const transfer = await TransferServices.transferForWalletRecharge(
                userDetail._id,
                "USD",
                "NGN",
                transfer_amount
            )
            if (transfer) {
                if (body.paymentMethod === "stripe") {
                    let { amount, status, created, id } = body.data.object;
                    amount = Number(amount / 100);
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
                        transaction_type: ETRANSACTION_TYPE.rechargeWallet,
                        receiver_id: userDetail._id
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
                } else if (body.paymentMethod === "paystack") {
                    const amount = Number(body.data.amount / 100);
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
                        transaction_type: ETRANSACTION_TYPE.rechargeWallet,
                        receiver_id: userDetail._id
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
                }
            }

            if (Object.keys(payload).length > 0) {
                payload.payment_type = EPaymentType.rechargeWallet
                let add_wallet = await Wallet.create(payload);
            }
        }
    });
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
        amount = Number(body.data.object.amount / 100);
        status = body.data.object.status;
        created = body.data.object.created;
        id = body.data.object.id;
    }
    if (body.paymentMethod === "paystack") {
        userID = body.data.metadata.userID;
        propertyID = body.data.metadata.propertyID;
        notificationID = body.data.metadata.notificationID;
        let createdAt = body.data.paid_at;

        amount = Number(body.data.amount / 100);
        status = body.data.status;
        created = moment(createdAt).unix();
        id = body.data.id;
    }

    const propertyDetails = await Property.findById(propertyID);


    if (propertyDetails.rentType === RentType.MONTHLY) {
        const originalDate = moment.unix(propertyDetails.rent_period_due);
        const oneMonthLater = originalDate.add(1, 'months');
        const timestampOneMonthLater = oneMonthLater.unix();
        let newCount = propertyDetails.payment_count + 1;

        const updateProperty = await Property.findByIdAndUpdate(propertyID, {
            rented: true,
            renterID: userID,
            rent_period_due: timestampOneMonthLater,
            payment_count: newCount,
            inDemand: false,        // setting this to false because when property is rented then should remove from in demand
            next_payment_at: new Date(Number(timestampOneMonthLater) * 1000),
        })

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
            inDemand: false,        // setting this to false because when property is rented then should remove from in demand
            next_payment_at: new Date(Number(timestampOneQuaterLater) * 1000),
        })

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
        addRenterHistory.save()

    } else if (propertyDetails.rentType === RentType.YEARLY) {
        // Convert timestamp to a Moment.js object
        const originalDate = moment.unix(propertyDetails.rent_period_due);

        // Add one year to the original date
        const oneYearLater = originalDate.add(1, 'years');

        // Get the Unix timestamp of one year later
        const timestampOneYearLater = oneYearLater.unix();
        let newCount = propertyDetails.payment_count + 1;
        const updateProperty = await Property.findByIdAndUpdate(propertyID, {
            rented: true,
            renterID: userID,
            payment_count: newCount,
            rent_period_due: timestampOneYearLater,
            inDemand: false,        // setting this to false because when property is rented then should remove from in demand
            next_payment_at: new Date(Number(timestampOneQuaterLater) * 1000),
        })

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
    let breakdown = PropertyServices.getRentalBreakUp(propertyDetails);
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

    // Adding commission for property manager
    if (propertyDetails.property_manager_id) {       // If property owner is landlord
        if (propertyDetails.landlord_id) {
            await commissionServices.rentCommissionToPM(propertyDetails, null, propertyDetails.rent);
        }
        // Sending email to property manager about successful rent payment
        TransactionServices.sendRentPaymentNotificationAndEmail({
            property: propertyDetails,
            renter_details: renterDetails,
            send_to: propertyDetails?.property_manager_id,
            amount: amount
        });
    }
    data.save()
    if (notificationID) {
        await Notification.findByIdAndDelete(notificationID)
    }

    // Requesting Admin for transfer admin account to landlord account
    if (propertyDetails?.landlord_id) {
        TransferServices.makeTransferForPropertyRent(propertyDetails, null, breakdown.landlord_earning);

        // Sending email to landlord about successful rent payment
        TransactionServices.sendRentPaymentNotificationAndEmail({
            property: propertyDetails,
            renter_details: renterDetails,
            send_to: propertyDetails?.landlord_id,
            amount: amount
        });
    }

    // Sending email to renter about successful rent payment
    if (data?._id) {
        rentPaidEmailToRenter({
            email: renterDetails?.email,
            amount: amount,
            property_name: propertyDetails.propertyName,
            renter_name: renterDetails?.fullName,
            transaction_id: data._id
        })
    }

    return {
        data: [],
        message: "success",
        status: true,
        statusCode: 200,

    }
}

export { addStripeTransaction, rechargeWallet, addStripeTransactionForOld };
