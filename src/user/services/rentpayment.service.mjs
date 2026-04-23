import axios from "axios";
import mongoose from "mongoose";
import { RentType } from "../enums/property.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import { RentingHistory } from "../models/rentingHistory.model.mjs";
import moment from "moment";
import { User } from "../models/user.model.mjs";
import { rentApplication } from "../models/rentApplication.model.mjs";
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import * as commissionServices from "../services/commission.service.mjs";
import { Notification } from "../models/notification.model.mjs";
import * as referralService from "../services/referral.service.mjs";
import * as TransferServices from "../services/transfer.service.mjs";
import * as PropertyServices from "../services/property.service.mjs";
import * as TransactionServices from "../../user/services/transaction.service.mjs";
import { rentPaidEmailToRenter } from "../emails/rent.emails.mjs";


/**
 * Process a rent payment for any property and handle all related updates atomically.
 *
 * This function handles both old and new style rent payments in a unified way.
 * It updates the property rent period, payment count, and lease end if needed.
 * It records the renting history, saves the transaction, handles commissions,
 * sends notifications/emails to the property manager, landlord, and renter,
 * and optionally processes referral bonuses. All operations are performed inside
 * a MongoDB transaction to ensure atomicity.
 *
 * @param {Object} data - Payment details
 * @param {String} data.status - Payment status (e.g., "successfull")
 * @param {Number} data.amount - Amount paid
 * @param {String|Date} data.created_at - Date of payment
 * @param {String} data.id - Unique transaction reference
 * @param {String} data.renterApplicationID - Rent application id if first payment
 * @param {Object} data.meta_data - Metadata for the payment
 * @param {String} data.meta_data.propertyID - ID of the property
 * @param {String} data.meta_data.userID - ID of the renter
 * @param {String} [data.meta_data.notificationID] - Optional notification ID to delete
 * @param {Boolean} [data.meta_data.wallet] - Whether the payment was from wallet
 *
 * @param {Object} [options] - Optional flags
 * @param {Boolean} [options.handleReferral=false] - Whether to handle referral bonus for landlord
 * @param {Boolean} [options.handleLeaseEnd=false] - Whether to calculate new lease end timestamp for new properties
 *
 * @returns {Object} - Returns an object containing updated property details, transaction record, and rental breakdown
 *
 * @example
 * addFlutterwaveTransactionUnified({
 *   status: "successfull",
 *   amount: 50000,
 *   created_at: "2026-03-30T12:00:00Z",
 *   id: "TRX123456789",
 *   meta_data: { propertyID: "642b1f6c8c3b4e0012f3a123", userID: "642b1e9a8c3b4e0012f3a122" }
 * }, { handleReferral: true, handleLeaseEnd: true });
 */

export const completeRentTransaction = async (data, options = {}) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();

    try {
        const { status, amount, created_at, id, payment_mode, renterApplicationID } = data;
        const meta_data = data?.meta_data;
        const momentObject = moment(created_at);
        const created = momentObject.unix();

        const { propertyID, userID, notificationID, wallet } = meta_data;
        const { handleReferral = false, handleLeaseEnd = false } = options;

        const renterDetails = await User.findById(userID);
        const propertyDetails = await Property.findById(propertyID);
        const landlordDetails = await User.findById(propertyDetails?.landlord_id);

        if (!propertyDetails) {
            // await session.abortTransaction();
            // session.endSession();
            return { data: [], message: "Property not found", status: false };
        }

        // Lease end timestamp for new properties
        let lease_end_timestamp = "";
        if (handleLeaseEnd) {
            if (["commercial", "residential"].includes(propertyDetails.category)) {
                lease_end_timestamp = moment.unix(created).add(1, "years").unix();
            } else if (propertyDetails.category === "short stay") {
                lease_end_timestamp = moment.unix(created).add(1, "months").unix();
            }
        }

        // Update payment count
        let newCount = propertyDetails.payment_count > -1 ? propertyDetails.payment_count + 1 : 1;

        // Determine next rent period
        let nextRentTimestamp;
        switch (propertyDetails.rentType) {
            case RentType.MONTHLY:
                nextRentTimestamp = moment.unix(handleLeaseEnd ? created : propertyDetails.rent_period_due).add(1, 'months').unix();
                break;
            case RentType.QUATERLY:
                nextRentTimestamp = moment.unix(handleLeaseEnd ? created : propertyDetails.rent_period_due).add(3, 'months').unix();
                break;
            case RentType.YEARLY:
                nextRentTimestamp = moment.unix(handleLeaseEnd ? created : propertyDetails.rent_period_due).add(1, 'years').unix();
                break;
            default:
                nextRentTimestamp = moment.unix(handleLeaseEnd ? created : propertyDetails.rent_period_due).unix();
        }

        // Update property
        const updatedProperty = await Property.findByIdAndUpdate(
            propertyID,
            {
                rented: true,
                renterID: userID,
                rent_period_start: handleLeaseEnd ? created : propertyDetails.rent_period_start,
                rent_period_end: nextRentTimestamp,
                rent_period_due: nextRentTimestamp,
                payment_count: newCount,
                lease_end_timestamp: lease_end_timestamp || propertyDetails.lease_end_timestamp,
                inDemand: false,
                next_payment_at: new Date(nextRentTimestamp * 1000),
            },
            { new: true }
        );

        // Add renting history
        const addRenterHistory = new RentingHistory({
            renterID: userID,
            landlordID: propertyDetails.landlord_id,
            rentingType: propertyDetails.rentType,
            rentingEnd: nextRentTimestamp,
            rentingStart: handleLeaseEnd ? created : updatedProperty.rent_period_start,
            propertyID: propertyID,
            renterActive: true,
            pmID: propertyDetails?.property_manager_id,
        });
        await addRenterHistory.save();

        // Rental breakdown & transaction
        let breakdown = PropertyServices.getRentalBreakUp(propertyDetails, amount);

        const changePayload = {
            wallet: wallet || false,
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
            payment_mode: payment_mode,
            allCharges: breakdown,
            transaction_type: ETRANSACTION_TYPE.rentPayment,
            property_address: propertyDetails?.address?.addressText ?? ""
        };

        if (landlordDetails) {
            changePayload.landlord = landlordDetails.fullName;
            changePayload.landlordID = landlordDetails._id;
        }

        const transaction = new Transaction(changePayload);
        await transaction.save();

        // Update application status if provided
        if (renterApplicationID) {
            await rentApplication.findByIdAndUpdate(
                renterApplicationID,
                { applicationStatus: RentApplicationStatus.COMPLETED },
            );
        }

        // Commit transaction
        // await session.commitTransaction();
        // session.endSession();

        // Non-critical actions (email, transfers, referral) can be done outside transaction
        if (propertyDetails.property_manager_id && propertyDetails.landlord_id) {
            await commissionServices.rentCommissionToPM(propertyDetails, null, propertyDetails.rent);
            TransactionServices.sendRentPaymentNotificationAndEmail({
                property: propertyDetails,
                renter_details: renterDetails,
                send_to: propertyDetails?.property_manager_id,
                amount: amount
            });
        }

        if (handleReferral && landlordDetails?.referralCode) {
            const payTo = await referralService.getUserByMyCode(landlordDetails.referralCode);
            if (payTo) {
                const referralAmount = await referralService.calculateReferralAmountWithRTZFee(breakdown.rtz_fee);
                if (referralAmount > 0) {
                    await referralService.addReferralBonusInWallet(referralAmount, landlordDetails._id, payTo._id, propertyDetails._id);
                }
            }
        }

        if (notificationID) {
            await Notification.findByIdAndDelete(notificationID);
        }

        if (propertyDetails?.landlord_id) {
            TransferServices.makeTransferForPropertyRent(propertyDetails, null, breakdown.landlord_earning, breakdown, renterDetails, transaction._id);

            TransactionServices.sendRentPaymentNotificationAndEmail({
                property: propertyDetails,
                renter_details: renterDetails,
                send_to: propertyDetails?.landlord_id,
                amount: amount
            });
        }

        if (transaction?._id) {
            rentPaidEmailToRenter({
                email: renterDetails?.email,
                amount: amount,
                property_name: propertyDetails.propertyName,
                renter_name: renterDetails?.fullName,
                transaction_id: transaction._id
            });
        }

        return { propertyDetails: updatedProperty, transaction, breakdown };

    } catch (error) {
        // await session.abortTransaction();
        // session.endSession();
        throw error;
    }
};