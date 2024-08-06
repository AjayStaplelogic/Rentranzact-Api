import { InspectionStatus } from "../enums/inspection.enums.mjs";
import { Calender } from "../models/calender.model.mjs";
import { Inspection } from "../models/inspection.model.mjs";
import { Property } from "../models/property.model.mjs";

async function addToCalender(body, userID) {

    const { id, date, time, fullDay } = body;

    if (fullDay) {

        const payload = {
            date, fullDay,
            userID: userID
        }

        const data = new Calender(payload)

        data.save()

        return {
            data: data,
            message: "dashboard stats",
            status: true,
            statusCode: 201,
        };
    } else {

        const payload = {
            id, date, time, fullDay,
            userID: userID
        }

        const data = new Calender(payload)

        data.save()

        return {
            data: data,
            message: "dashboard stats",
            status: true,
            statusCode: 201,
        };

    }



}


async function getToCalender(userID) {

    const result = await Calender.find({ userID: userID })

    // console.log(result, "====resulttttttttt")

    const result2 = await Inspection.find({
        inspectionStatus: InspectionStatus.INITIATED,
        landlordID: userID
    }).select('id inspectionTime inspectionDate fullDay');


    // console.log(result2, "====resulttttttttt")

    const data = result.concat(result2);

    return {
        data: data,
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}



async function getRenterCalender(userID, propertyID) {

    const property = await Property.findById(propertyID);

    const result2 = await Inspection.find({
        inspectionStatus: InspectionStatus.INITIATED,
        "RenterDetails.id": userID
    }).select('id inspectionTime inspectionDate landlordID fullDay');

    const result = await Calender.find({ userID: property.landlord_id })

    // console.log(result, "====resulttttttttt")




    // console.log(result2, "====resulttttttttt")

    const data = result.concat(result2);

    return {
        data: data,
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}


async function getTimeSlotByDate(date, userID) {
    // 66a1f13f4f67e9c871bda6e0 Renter hom initiated ==parammmmsss
    // console.log(date, userID ,"paramssss")

    const data = await Inspection.find({
        "inspectionDate": date,
        inspectionStatus: InspectionStatus.INITIATED,
        "RenterDetails.id": userID
    }).select('id inspectionTime inspectionDate landlordID fullDay');

    return {
        data: data,
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}



export { addToCalender, getToCalender, getRenterCalender, getTimeSlotByDate };
