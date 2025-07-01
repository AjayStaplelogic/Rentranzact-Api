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
import * as TransactionServices from "../../user/services/transaction.service.mjs";
import { rentPaidEmailToRenter } from "../emails/rent.emails.mjs";
import axios from "axios";

async function addFlutterwaveTransaction(body, renterApplicationID) {
    const { status, amount, created_at, id, meta_data } = body?.data;
    const momentObject = moment(created_at);

    // Get the timestamp (milliseconds since the Unix epoch)
    const created = momentObject.unix();
    const { wallet, userID, notificationID, propertyID } = meta_data;
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
                inDemand: false,        // setting this to false because when property is rented then should remove from in demand
                next_payment_at: new Date(Number(timestampOneMonthLater) * 1000),
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
                inDemand: false,        // setting this to false because when property is rented then should remove from in demand
                next_payment_at: new Date(Number(timestampOneQuaterLater) * 1000),
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
                inDemand: false,        // setting this to false because when property is rented then should remove from in demand
                next_payment_at: new Date(Number(timestampOneYearLater) * 1000),
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

        let breakdown = PropertyServices.getRentalBreakUp(propertyDetails,  amount);
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
            transaction_type: ETRANSACTION_TYPE.rentPayment,
            property_address : propertyDetails?.address?.addressText ?? ""
        }

        if (landlordDetails) {
            changePayload.landlord = landlordDetails.fullName;
            changePayload.landlordID = landlordDetails._id;
        }

        const data = new Transaction(changePayload)
        await rentApplication.findByIdAndUpdate(renterApplicationID, { "applicationStatus": RentApplicationStatus.COMPLETED });

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
            TransferServices.makeTransferForPropertyRent(propertyDetails, null, breakdown.landlord_earning, breakdown);
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
        console.log('**********Add To Wallet Functio n***********')
        let { amount, status, created_at, id } = body.data;
        let { userID } = body.meta_data;
        const created = moment(created_at).unix();
        if (status === "successful") {
            User.findById(userID).then(async (userDetail) => {
                if (userDetail) {
                    const transfer = await TransferServices.transferForWalletRecharge(
                        userDetail._id,
                        "USD",
                        "NGN",
                        amount
                    )
                    console.log(transfer, '==========transfer')
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
    const { status, amount, created_at, id, meta_data } = body.data;
    const momentObject = moment(created_at);
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
                inDemand: false,        // setting this to false because when property is rented then should remove from in demand
                next_payment_at: new Date(Number(timestampOneMonthLater) * 1000),
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
                inDemand: false,        // setting this to false because when property is rented then should remove from in demand
                next_payment_at: new Date(Number(timestampOneQuaterLater) * 1000),
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
                inDemand: false,       // setting this to false because when property is rented then should remove from in demand
                next_payment_at: new Date(Number(timestampOneYearLater) * 1000),
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
        let breakdown = PropertyServices.getRentalBreakUp(propertyDetails, amount);
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
            transaction_type: ETRANSACTION_TYPE.rentPayment,
            property_address : propertyDetails?.address?.addressText ?? ""
        }

        if (landlordDetails) {
            changePayload.landlord = landlordDetails.fullName;
            changePayload.landlordID = landlordDetails._id;
        }

        const data = new Transaction(changePayload)
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
            TransferServices.makeTransferForPropertyRent(propertyDetails, null, breakdown.landlord_earning, breakdown);
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
    }

    return {
        data: [],
        message: "dashboard stats",
        status: true,
        statusCode: 200,
    };

}

async function verifyBankAccountWithFlutterwave(account_bank, account_number) {
    const url = `https://api.flutterwave.com/v3/accounts/resolve`;
    const payload = {
        account_bank: account_bank,
        account_number: account_number,
    }
    const config = {
        headers: {
            "Authorization": `Bearer ${process.env.FLUTTERWAVE_SECRET}`
        }
    }
    try {
        const { data } = await axios.post(url, payload, config);
        return data?.data;
    } catch (error) {
        if(error?.response?.data?.message){
            throw error?.response?.data?.message
        }
        throw error;
    }
}

// verifyBankAccount("0448", "0690000034")

export {
    addFlutterwaveTransaction,
    addToWallet,
    addFlutterwaveTransactionForOld,
    verifyBankAccountWithFlutterwave
};
