import { RentType } from "../enums/property.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import { RentingHistory } from "../models/rentingHistory.model.mjs";
import moment from "moment";
import { User } from "../models/user.model.mjs";

async function addFlutterwaveTransaction(body) {

    const { status, amount, createdAt, id, meta_data } = body;

    const momentObject = moment(createdAt);
    // Get the timestamp (milliseconds since the Unix epoch)
    const create = momentObject.valueOf();

    const { wallet, propertyID, userID } = meta_data;

    const renterDetails = await User.findById(userID)

    console.log(meta_data, "=====meta data")

    if (wallet) {

    } else {

        const propertyDetails = await Property.findById(propertyID);

        const landlordDetails = await User.findById(propertyDetails.landlord_id)

        if (propertyDetails.rentType === RentType.MONTHLY) {

            const originalDate = moment.unix(create);

            const oneMonthLater = originalDate.add(1, 'months');

            const timestampOneMonthLater = oneMonthLater.unix();

            const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: create, rent_period_end: timestampOneMonthLater })

            const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneMonthLater, rentingStart: create, propertyID: propertyID, renterActive: true })

            addRenterHistory.save()

            console.log(timestampOneMonthLater, "-------------timestampOneMonthLater")

        } else if (propertyDetails.rentType === RentType.QUATERLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(create);

            // Add one year to the original date
            const oneQuaterLater = originalDate.add(3, 'months');

            // Get the Unix timestamp of one year later
            const timestampOneQuaterLater = oneQuaterLater.unix();
            const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: create, rent_period_end: timestampOneQuaterLater })

            const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneQuaterLater, rentingStart: create, propertyID: propertyID, renterActive: true })


            console.log(timestampOneQuaterLater, "------------------timestampOneQuaterLater")


            addRenterHistory.save()

        } else if (propertyDetails.rentType === RentType.YEARLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(create);

            // Add one year to the original date
            const oneYearLater = originalDate.add(1, 'yearly');

            // Get the Unix timestamp of one year later
            const timestampOneYearLater = oneYearLater.unix();

            console.log(timestampOneYearLater, "-----timestampOneYearLater")
            const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: create, rent_period_end: timestampOneYearLater })

            const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneYearLater, rentingStart: create, propertyID, renterActive: true })
            addRenterHistory.save()
        }

        const changePayload = {
            wallet: false,
            type: "Debit",
            intentID: id,
            status: status,
            amount: amount,
            date: create,
            payment_mode: "flutterwave",
            propertyID : propertyID,
            renterID : userID,
            landlordID : propertyDetails.landlord_id,
            renter : renterDetails.fullName,
            property : propertyDetails.name,
            landlord : landlordDetails.fullName,
            payment_mode : "flutterwave"


        }

        const data = new Transaction(changePayload)

        data.save()

    }



    return {
        data: [],
        message: "dashboard stats",
        status: true,
        statusCode: 200,
    };

}

export { addFlutterwaveTransaction };
