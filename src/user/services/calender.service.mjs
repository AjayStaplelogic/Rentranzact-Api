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

async function getPMCalender(userID) {
    const result = await Calender.find({ userID: userID })

    const result2 = await Inspection.find({
        inspectionStatus: InspectionStatus.INITIATED,
        property_manager_id: userID
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

async function getToCalender(userID) {

    const result = await Calender.find({ userID: userID })

    // console.log(result, "====resulttttttttt")

    const result2 = await Inspection.find({
        inspectionStatus: InspectionStatus.INITIATED,
        landlordID: userID
    }).select('id inspectionTime inspectionDate fullDay');

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

    let calender_query = {}
    let user_arr = [];
    if (property) {
        if (property.landlord_id) {
            user_arr.push(property.landlord_id);
        }
        if (property.property_manager_id) {
            user_arr.push(property.property_manager_id);
        }
    }
    calender_query["userID"] = { $in: user_arr }
    const result = await Calender.find(calender_query)

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



export { addToCalender, getToCalender, getRenterCalender, getTimeSlotByDate, getPMCalender };
