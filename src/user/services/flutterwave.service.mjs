import { RentType } from "../enums/property.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import { RentingHistory } from "../models/rentingHistory.model.mjs";
import moment from "moment";
import { User } from "../models/user.model.mjs";
import { rentApplication } from "../models/rentApplication.model.mjs";
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import { Wallet } from "../models/wallet.model.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import * as commissionServices from "../services/commission.service.mjs";
import { Notification } from "../models/notification.model.mjs";
import { EPaymentType } from "../enums/wallet.enum.mjs"
import { ETRANSACTION_TYPE } from "../enums/common.mjs";
import * as referralService from "../services/referral.service.mjs";
import * as TransferServices from "../services/transfer.service.mjs";
import * as PropertyServices from "../services/property.service.mjs";

async function addFlutterwaveTransaction(body, renterApplicationID) {
    const { status, amount, createdAt, id, meta_data } = body;
    const momentObject = moment(createdAt);
    // Get the timestamp (milliseconds since the Unix epoch)
    const created = momentObject.unix();
    const { wallet, propertyID, userID, notificationID } = meta_data;
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
                lease_end_timestamp: lease_end_timestamp,
                inDemand: false        // setting this to false because when property is rented then should remove from in demand
            })

            const addRenterHistory = new RentingHistory({
                renterID: userID,
                landlordID: propertyDetails?.landlord_id,
                rentingType: propertyDetails?.rentType,
                rentingEnd: timestampOneMonthLater,
                rentingStart: created,
                propertyID: propertyID,
                renterActive: true,
                pmID: propertyDetails?.property_manager_id,
            })

            addRenterHistory.save()
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
                inDemand: false        // setting this to false because when property is rented then should remove from in demand
            })

            const addRenterHistory = new RentingHistory({
                renterID: userID,
                landlordID: propertyDetails.landlord_id,
                rentingType: propertyDetails.rentType,
                rentingEnd: timestampOneQuaterLater,
                rentingStart: created,
                propertyID: propertyID,
                renterActive: true,
                pmID: propertyDetails?.property_manager_id,
            });

            addRenterHistory.save()
        } else if (propertyDetails.rentType === RentType.YEARLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(created);

            // Add one year to the original date
            const oneYearLater = originalDate.add(1, 'years');

            // Get the Unix timestamp of one year later
            const timestampOneYearLater = oneYearLater.unix();
            const updateProperty = await Property.findByIdAndUpdate(propertyID, {
                rented: true,
                renterID: userID,
                rent_period_start: created,
                rent_period_end: timestampOneYearLater,
                rent_period_due: timestampOneYearLater,
                payment_count: newCount,
                lease_end_timestamp: lease_end_timestamp,
                inDemand: false        // setting this to false because when property is rented then should remove from in demand
            })

            const addRenterHistory = new RentingHistory({
                renterID: userID,
                landlordID: propertyDetails.landlord_id,
                rentingType: propertyDetails.rentType,
                rentingEnd: timestampOneYearLater,
                rentingStart: created,
                propertyID,
                renterActive: true,
                pmID: propertyDetails?.property_manager_id,
            })
            addRenterHistory.save()
        }

        let breakdown = PropertyServices.getRentalBreakUp(propertyDetails);
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
            allCharges: breakdown,
            transaction_type: ETRANSACTION_TYPE.rentPayment
        }

        if (landlordDetails) {
            changePayload.landlord = landlordDetails.fullName;
            changePayload.landlordID = landlordDetails._id;
        }

        const data = new Transaction(changePayload)
        await rentApplication.findByIdAndUpdate(renterApplicationID, { "applicationStatus": RentApplicationStatus.COMPLETED });

        // Adding commission for property manager
        if (propertyDetails.property_manager_id && propertyDetails.landlord_id) {       // If property owner is landlord
            await commissionServices.rentCommissionToPM(propertyDetails, null, rent);
        }

        data.save()

        // If landlord have referral code then transfering referral bonus to their parent or referrer
        if (landlordDetails?.referralCode) {
            const payTo = await referralService.getUserByMyCode(landlordDetails.referralCode); // amount to be transferred to
            if (payTo) {
                const referralAmount = await referralService.calculateReferralAmountWithRTZFee(breakdown.rtz_fee);
                if (referralAmount > 0) {
                    await referralService.addReferralBonusInWallet(referralAmount, landlordDetails._id, payTo._id, propertyDetails._id);
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
        }
    }

    return {
        data: [],
        message: "dashboard stats",
        status: true,
        statusCode: 200,
    };
}

async function addToWallet(body) {
    try {

        let { amount, status, createdAt, id } = body;
        let { userID } = body.meta_data;
        const created = moment(createdAt).unix();
        if (status === "successful") {
            User.findById(userID).then(async (userDetail) => {
                if (userDetail) {
                    const transfer = await TransferServices.transferForWalletRecharge(
                        userDetail._id,
                        "USD",
                        "NGN",
                        amount
                    )
                    if (transfer) {
                        let payload = {
                            amount,
                            status,
                            createdAt: created,
                            type: "CREDIT",
                            userID,
                            intentID: id,
                            payment_type: EPaymentType.rechargeWallet
                        }

                        let add_wallet = await Wallet.create(payload);
                        if (add_wallet) {
                            let transaction_payload = {
                                wallet: true,
                                amount: amount,
                                status: status,
                                date: created,
                                intentID: id,
                                type: "CREDIT",
                                payment_mode: "flutterwave",
                                transaction_type: ETRANSACTION_TYPE.rechargeWallet,
                                receiver_id: userDetail._id
                            };

                            if (userDetail.role === UserRoles.LANDLORD) {
                                transaction_payload.landlordID = userDetail._id;
                            } else if (userDetail.role === UserRoles.RENTER) {
                                transaction_payload.renterID = userDetail._id;
                            } else if (userDetail.role === UserRoles.PROPERTY_MANAGER) {
                                transaction_payload.pmID = userDetail._id;
                            }

                            let create_transaction = await Transaction.create(transaction_payload);
                        }
                    }
                }
            });
        }
    } catch (error) {
    }
}

async function addFlutterwaveTransactionForOld(body) {
    const { status, amount, createdAt, id, meta_data } = body;
    const momentObject = moment(createdAt);
    // Get the timestamp (milliseconds since the Unix epoch)
    const created = momentObject.unix();
    const { propertyID, userID, notificationID } = meta_data;
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
                payment_count: newCount,
                inDemand: false        // setting this to false because when property is rented then should remove from in demand
            })

            const addRenterHistory = new RentingHistory({
                renterID: userID,
                landlordID: propertyDetails?.landlord_id,
                rentingType: propertyDetails?.rentType,
                rentingEnd: timestampOneMonthLater,
                propertyID: propertyID,
                renterActive: true,
                rentingStart: updateProperty.rent_period_start,
                pmID: propertyDetails?.property_manager_id,
            })

            addRenterHistory.save()
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
                rent_period_due: timestampOneQuaterLater,
                inDemand: false        // setting this to false because when property is rented then should remove from in demand
            })

            const addRenterHistory = new RentingHistory({
                renterID: userID,
                landlordID: propertyDetails?.landlord_id,
                rentingType: propertyDetails?.rentType,
                rentingEnd: timestampOneQuaterLater,
                rentingStart: updateProperty.rent_period_start,
                propertyID: propertyID,
                renterActive: true,
                pmID: propertyDetails?.property_manager_id,
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
                rent_period_due: timestampOneYearLater,
                inDemand: false        // setting this to false because when property is rented then should remove from in demand
            })

            const addRenterHistory = new RentingHistory({
                renterID: userID,
                landlordID: propertyDetails?.landlord_id,
                rentingType: propertyDetails?.rentType,
                rentingEnd: timestampOneYearLater,
                rentingStart: updateProperty.rent_period_start,
                propertyID: propertyID,
                renterActive: true,
                pmID: propertyDetails?.property_manager_id,
            })
            addRenterHistory.save()
        }
        let breakdown = PropertyServices.getRentalBreakUp(propertyDetails);
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
            allCharges: breakdown,
            transaction_type: ETRANSACTION_TYPE.rentPayment
        }

        if (landlordDetails) {
            changePayload.landlord = landlordDetails.fullName;
            changePayload.landlordID = landlordDetails._id;
        }

        const data = new Transaction(changePayload)
        if (propertyDetails.property_manager_id && propertyDetails.landlord_id) {       // If property owner is landlord
            await commissionServices.rentCommissionToPM(propertyDetails, null, rent);
        }
        data.save()
        if (notificationID) {
            await Notification.findByIdAndDelete(notificationID)
        }

        // Requesting Admin for transfer admin account to landlord account
        if (propertyDetails?.landlord_id) {
            TransferServices.makeTransferForPropertyRent(propertyDetails, null, breakdown.landlord_earning);
        }
    }

    return {
        data: [],
        message: "dashboard stats",
        status: true,
        statusCode: 200,
    };

}

export { addFlutterwaveTransaction, addToWallet, addFlutterwaveTransactionForOld };
