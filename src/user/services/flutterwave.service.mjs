import { Property } from "../models/property.model.mjs";
import { Transaction } from "../models/transactions.model.mjs";

async function addFlutterwaveTransaction(body) {


    const { status, amount, createdAt, id, meta_data } = body;

    const { wallet, propertyID , userID} = meta_data;
    if (wallet) {

    } else {

       
        const propertyDetails = await Property.findById(propertyID);


        if (propertyDetails.rentType === RentType.MONTHLY) {

            const originalDate = moment.unix(createdAt);

            const oneMonthLater = originalDate.add(1, 'months');

            const timestampOneMonthLater = oneMonthLater.unix();

            const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created, rent_period_end: timestampOneMonthLater })

            const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneMonthLater, rentingStart: created, propertyID: propertyID, renterActive: true })

            addRenterHistory.save()

            console.log(timestampOneMonthLater, "-------------timestampOneMonthLater")

        } else if (propertyDetails.rentType === RentType.QUATERLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(createdAt);

            // Add one year to the original date
            const oneQuaterLater = originalDate.add(3, 'months');

            // Get the Unix timestamp of one year later
            const timestampOneQuaterLater = oneQuaterLater.unix();
            const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created, rent_period_end: timestampOneQuaterLater })

            const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneQuaterLater, rentingStart: created, propertyID: propertyID, renterActive: true })


            console.log(timestampOneQuaterLater, "------------------timestampOneQuaterLater")


            addRenterHistory.save()

        } else if (propertyDetails.rentType === RentType.YEARLY) {
            // Convert timestamp to a Moment.js object
            const originalDate = moment.unix(createdAt);

            // Add one year to the original date
            const oneYearLater = originalDate.add(1, 'yearly');

            // Get the Unix timestamp of one year later
            const timestampOneYearLater = oneYearLater.unix();

            console.log(timestampOneYearLater, "-----timestampOneYearLater")
            const updateProperty = await Property.findByIdAndUpdate(propertyID, { rented: true, renterID: userID, rent_period_start: created, rent_period_end: timestampOneYearLater })

            const addRenterHistory = new RentingHistory({ renterID: userID, landlordID: propertyDetails.landlord_id, rentingType: propertyDetails.rentType, rentingEnd: timestampOneYearLater, rentingStart: created, propertyID: propertyID, renterActive: true })
            addRenterHistory.save()
        }

        const changePayload = {
            wallet: false,
            type: "Debit",
            intentID: id,
            status: status,
            amount: amount,
            date: createdAt,
            payment_mode: "flutterwave"
        }

        const data = new Transaction(changePayload)

        data.save()

    }



    return {
        data: data,
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}

export { addFlutterwaveTransaction };
