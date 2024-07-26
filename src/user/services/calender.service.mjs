import { InspectionStatus } from "../enums/inspection.enums.mjs";
import { Calender } from "../models/calender.model.mjs";
import { Inspection } from "../models/inspection.model.mjs";

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

    console.log(result, "====resulttttttttt")

    const result2 = await Inspection.find({
        inspectionStatus: InspectionStatus.INITIATED,
        landlordID: userID
    }).select('id inspectionTime inspectionDate');


    console.log(result2, "====resulttttttttt")

    const data = { ...result, ...result2 }

    return {
        data: data,
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}





export { addToCalender, getToCalender };
