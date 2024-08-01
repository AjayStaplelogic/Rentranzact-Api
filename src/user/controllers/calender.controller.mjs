import { UserRoles } from "../enums/role.enums.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addToCalender, getToCalender, getRenterCalender, getTimeSlotByDate } from "../services/calender.service.mjs";
import {Inspection } from "../models/inspection.model.mjs";

async function calender(req, res) {

    const { role, _id } = req.user.data;
    const { body } = req;


    if (role === UserRoles.LANDLORD) {

        const data = await addToCalender(body, _id);

        sendResponse(res, data.data, data.message, data.status, data.statusCode);

    }

}

async function getCalender(req, res) {

    const { _id, role } = req.user.data;
    const { propertyID } = req.query;


    if (role === UserRoles.LANDLORD) {

        const data = await getToCalender(_id);

        sendResponse(res, data.data, data.message, data.status, data.statusCode);

    } else if (role === UserRoles.RENTER) {

        const data = await getRenterCalender(_id, propertyID);

        sendResponse(res, data.data, data.message, data.status, data.statusCode);


    }

}
async function getTimeSlot(req, res) {

    const { role, _id } = req.user.data;
    const { date } = req.body;


    if (role === UserRoles.RENTER) {

        console.log("======user id", _id, "------------- date", date)

        const data = await getTimeSlotByDate(date, _id);

        sendResponse(res, data.data, data.message, data.status, data.statusCode);

    }

}

async function getCalenderTimeSlots(req, res) {
    try {
        console.log("[Calender Time Slot]")
        let { renterID, propertyID, landlordID, property_manager_id, day, month, year } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        let query2 = {};
        if (renterID) { query.renterID = renterID };
        if (propertyID) { query.propertyID = propertyID };
        if (landlordID) { query.landlordID = landlordID };
        if (property_manager_id) { query.property_manager_id = property_manager_id };
        if (year) { query2.year = Number(year) };
        if (month) { query2.month = Number(month) };
        if (day) { query2.day = Number(day) };
        let skip = Number(page - 1) * count;
        let pipeline = [
            {
                $match: query
            },
            {
                $set : {
                    inspectionDate: {
                        $dateFromString: {
                           dateString: "$inspectionDate",
                        }
                     }
                }
            },
            {
                $addFields: {
                    year: { $year: "$inspectionDate" },
                    month: { $month: "$inspectionDate" },
                    day: { $dayOfMonth: "$inspectionDate" },
                }
            },
            {
                $group: {
                    _id: {
                        year: "$year",
                        month: "$month",
                        day: "$day",
                    },
                    inspections: {
                        $push: {
                            inspectionTime: "$inspectionTime",
                            id : "$id",
                            fullDay : "$fullDay",
                        }
                    },
                }
            },
            {
                $lookup : {
                    from : "calenders",
                    let : {
                        year : "$_id.year",
                        month : "$_id.month",
                        day : "$_id.day",
                    },
                    pipeline : [
                        {
                            $set : {
                               date: {
                                    $dateFromString: {
                                       dateString: "$date",
                                    }
                                 }
                            }
                        },
                        {
                            $addFields: {
                                year: { $year: "$date" },
                                month: { $month: "$date" },
                                day: { $dayOfMonth: "$date" },
                            }
                        },
                        {
                            $match : {
                                $expr : {
                                    $and : [
                                        {$eq : ["$year", "$$year"]},
                                        {$eq : ["$month", "$$month"]},
                                        {$eq : ["$day", "$$day"]},
                                    ]
                                }
                            }
                        },
                        {
                            $project : {
                                inspectionTime : "$time",
                                id : "$id",
                                fullDay : "$fullDay",
                            }
                        }
                    ],
                    as : "calender_data"
                }
            },
            {
                $skip : Number(skip)
            },
            {
                $limit : Number(count)
            },
            {
                $facet : {
                    pagination : [
                        {
                            $count : "total"
                        },
                        {
                            $addFields : {
                                page : Number(page)
                            }
                        }
                    ],
                    data : [
                        {
                            $project : {
                                year : "$_id.year",
                                month : "$_id.month",
                                day : "$_id.day",
                                inspections : "$inspections",
                                calender_data : "$calender_data"
                            }
                        }
                    ]
                }
            }
        ]
        let inspections = await Inspection.aggregate(pipeline);

        sendResponse(res, inspections, "success", true, 200);

    } catch (error) {
        sendResponse(res, {}, `${error}`, false, 500);

    }
}

export { calender, getCalender, getTimeSlot, getCalenderTimeSlots }