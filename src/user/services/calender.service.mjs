import { Calender } from "../models/calender.model.mjs";

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

export { addToCalender };
