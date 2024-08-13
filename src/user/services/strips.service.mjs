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

    console.log(body, "----bodddyyyy")

    console.log("metadata ", body.data.object.metadata)

    const { userID, propertyID, notificationID } = body.data.object.metadata;
    await Notification.findByIdAndDelete(notificationID).then((Res) => console.log(Res, "====ress")).catch((err) => console.log(err, "===errr"))


    const { amount, status, created, id } = body.data.object;

    const propertyDetails = await Property.findById(propertyID);

    if (propertyDetails.rentType === RentType.MONTHLY) {

        const originalDate = moment.unix(created);

        const oneMonthLater = originalDate.add(1, 'months');

        const timestampOneMonthLater = oneMonthLater.unix();

        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created, rent_period_end: timestampOneMonthLater })

        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneMonthLater, rentingStart: created, propertyID: propertyID, renterActive: true })

        addRenterHistory.save()

        // console.log(timestampOneMonthLater, "-------------timestampOneMonthLater")

    } else if (propertyDetails.rentType === RentType.QUATERLY) {
        // Convert timestamp to a Moment.js object
        const originalDate = moment.unix(created);

        // Add one year to the original date
        const oneQuaterLater = originalDate.add(3, 'months');

        // Get the Unix timestamp of one year later
        const timestampOneQuaterLater = oneQuaterLater.unix();
        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created, rent_period_end: timestampOneQuaterLater })

        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneQuaterLater, rentingStart: created, propertyID: propertyID, renterActive: true })


        // console.log(timestampOneQuaterLater, "------------------timestampOneQuaterLater")


        addRenterHistory.save()

    } else if (propertyDetails.rentType === RentType.YEARLY) {
        // Convert timestamp to a Moment.js object
        const originalDate = moment.unix(created);

        // Add one year to the original date
        const oneYearLater = originalDate.add(1, 'yearly');

        // Get the Unix timestamp of one year later
        const timestampOneYearLater = oneYearLater.unix();

        // console.log(timestampOneYearLater, "-----timestampOneYearLater")
        const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created, rent_period_end: timestampOneYearLater })

        const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneYearLater, rentingStart: created, propertyID: propertyID, renterActive: true })
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
            total_amount: 0
        }


        let rent = Number(property.rent);
        data.rent = property.rent;
        data.service_charge = property.servicesCharges;
        data.agency_fee = (rent * RentBreakDownPer.AGENCY_FEE) / 100;
        data.legal_Fee = (rent * RentBreakDownPer.LEGAL_FEE_PERCENT) / 100;
        data.caution_deposite = (rent * RentBreakDownPer.CAUTION_FEE_PERCENT) / 100;
        data.insurance = 0;    // variable declaration for future use
        data.total_amount = rent + data.insurance + dataMerge.agency_fee + data.legal_Fee + data.caution_deposite;


        return data
    }

    let breakdown = await rentalBreakdown(propertyID)

    const data = new Transaction({ wallet: false, renterID: userID, propertyID: propertyID, amount: amount, status: status, date: created, intentID: id, property: propertyDetails.propertyName, renter: renterDetails.fullName, landlord: landlordDetails.fullName, landlordID: landlordDetails._id, type: "DEBIT", payment_mode: "stripe", allCharges: breakdown })

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

    const { userID } = body.data.object.metadata;

    const userDetail = await User.findById(userID);

    const { amount, status, created, id } = body.data.object;
    let payload = {}

    if (userDetail.role === UserRoles.RENTER) {
        payload = {
            amount,
            status,
            createdAt: created,
            type: "CREDIT",
            userID,
            intentID: id
        }

        const data_ = new Transaction({ wallet: true, renterID: userID, amount: amount, status: status, date: created, intentID: id, type: "CREDIT", payment_mode: "stripe" })

        data_.save()
        if (status === "succeeded") {

            const data__ = await User.findByIdAndUpdate(
                userID,
                { $inc: { walletPoints: amount } },
                { new: true }
            );

        }

    } else if (userDetail.role === UserRoles.LANDLORD) {
        payload = {
            amount,
            status,
            createdAt: created,
            type: "CREDIT",
            landlordID: userID,
            intentID: id
        }

    }

    const data = new Wallet(payload)
    data.save()

    const data_ = new Transaction({ wallet: true, renterID: userID, amount: amount, status: status, date: created, intentID: id, type: "CREDIT", payment_mode: "stripe" })
    data_.save()

    return {

        data: [],
        message: "success",
        status: true,
        statusCode: 200,

    }
}

export { addStripeTransaction, rechargeWallet };
