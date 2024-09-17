import { UserRoles } from "../enums/role.enums.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addToCalender, getToCalender, getRenterCalender, getTimeSlotByDate ,getPMCalender } from "../services/calender.service.mjs";
import { Inspection } from "../models/inspection.model.mjs";
import { Calender } from "../models/calender.model.mjs";
import { validator } from "../helpers/schema-validator.mjs";
import * as calenderValidations from "../validations/calender.validation.mjs";
import { User } from "../models/user.model.mjs";

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


    } else if (role === UserRoles.PROPERTY_MANAGER) {


      const data = await getPMCalender(_id, propertyID);

        sendResponse(res, data.data, data.message, data.status, data.statusCode);


    } 

}
async function getTimeSlot(req, res) {

    const { role, _id } = req.user.data;
    const { date } = req.body;


    if (role === UserRoles.RENTER) {

        // console.log("======user id", _id, "------------- date", date)

        const data = await getTimeSlotByDate(date, _id);

        sendResponse(res, data.data, data.message, data.status, data.statusCode);

    }

}

async function getCalenderTimeSlots(req, res) {
    try {
        // console.log("[Calender Time Slot]")
        let { renterID, propertyID, landlordID, property_manager_id, day, month, year } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        let query2 = {};
        if (renterID) { query["RenterDetails.id"] = renterID };
        if (propertyID) { query.propertyID = propertyID };
        if (landlordID) { query.landlordID = landlordID };
        if (property_manager_id) { query.property_manager_id = property_manager_id };
        if (year) { query2.year = Number(year) };
        if (month) { query2.month = Number(month) };
        if (day) { query2.day = Number(day) };
        let skip = Number(page - 1) * count;
        // console.log(query, '===query')
        let pipeline = [
            {
                $match: query
            },
            {
                $set: {
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
                $match: query2
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
                            id: "$id",
                            fullDay: "$fullDay",
                            renter_id : "$RenterDetails.id"
                        }
                    },
                }
            },
            // {
            //     $lookup : {
            //         from : "calenders",
            //         let : {
            //             year : Number(year),
            //             month : Number(month),
            //             day : Number(day)
            //         },
            //         pipeline : [
            //             {
            //                 $match : {
            //                     userID : landlordID
            //                 }
            //             },
            //             {
            //                 $set : {
            //                    date: {
            //                         $dateFromString: {
            //                            dateString: "$date",
            //                         }
            //                      }
            //                 }
            //             },
            //             {
            //                 $addFields: {
            //                     year: { $year: "$date" },
            //                     month: { $month: "$date" },
            //                     day: { $dayOfMonth: "$date" },
            //                 }
            //             },
            //             {
            //                 $match : {
            //                     $expr : {
            //                         $and : [
            //                             {$eq : ["$year", "$$year"]},
            //                             {$eq : ["$month", "$$month"]},
            //                             {$eq : ["$day", "$$day"]},
            //                         ]
            //                     }
            //                 }
            //             },
            //             {
            //                 $project : {
            //                     inspectionTime : "$time",
            //                     id : "$id",
            //                     fullDay : "$fullDay",
            //                 }
            //             }
            //         ],
            //         as : "calender_data"
            //     }
            // },

            {
                $facet: {
                    pagination: [
                        {
                            $count: "total"
                        },
                        {
                            $addFields: {
                                page: Number(page)
                            }
                        }
                    ],
                    data: [
                        {
                            $project: {
                                year: "$_id.year",
                                month: "$_id.month",
                                day: "$_id.day",
                                inspections: "$inspections",
                                // calender_data : "$calender_data"
                            }
                        },
                        {
                            $unset: ["_id"]
                        },
                        {
                            $skip: Number(skip)
                        },
                        {
                            $limit: Number(count)
                        },
                    ]
                }
            }
        ]
        let inspections = await Inspection.aggregate(pipeline);

        // let calender_pipeline = [
        //     {
        //         $match : {
        //             userID : landlordID
        //         }
        //     },
        //     {
        //         $set : {
        //            date: {
        //                 $dateFromString: {
        //                    dateString: "$date",
        //                 }
        //              }
        //         }
        //     },
        //     {
        //         $addFields: {
        //             year: { $year: "$date" },
        //             month: { $month: "$date" },
        //             day: { $dayOfMonth: "$date" },
        //         }
        //     },
        //     {
        //         $match: query2
        //     },
        //     {
        //         $project : {
        //             inspectionTime : "$time",
        //             id : "$id",
        //             fullDay : "$fullDay",
        //         }
        //     }
        // ];

        // let calender_data = await Calender.aggregate(calender_pipeline);

        // inspections.data[0].calender_data = calender_data;

        sendResponse(res, inspections, "success", true, 200);

    } catch (error) {
        sendResponse(res, {}, `${error}`, false, 500);

    }
}

async function getCalenderBlockedSlots(req, res) {
    try {
        // console.log("[Calender Blocked Time Slot]")
        let { userID, day, month, year } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        let query2 = {};
        if (userID) { query.userID = userID };
        if (year) { query2.year = Number(year) };
        if (month) { query2.month = Number(month) };
        if (day) { query2.day = Number(day) };
        let skip = Number(page - 1) * count;
        console.log(query, '===query')
        console.log(query2, '===query2')

        let pipeline = [
            {
                $match: query
            },
            {
                $set: {
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
                $match: query2
            },
            {
                $group: {
                    _id: {
                        year: "$year",
                        month: "$month",
                        day: "$day",
                    },
                    blocked_dates: {
                        $push: {
                            _id : "$_id",
                            inspectionTime: "$time",
                            id: "$id",
                            fullDay: "$fullDay",
                        }
                    },
                }
            },
            {
                $facet: {
                    pagination: [
                        {
                            $count: "total"
                        },
                        {
                            $addFields: {
                                page: Number(page)
                            }
                        }
                    ],
                    data: [
                        {
                            $project: {
                                year: "$_id.year",
                                month: "$_id.month",
                                day: "$_id.day",
                                blocked_dates: "$blocked_dates",
                            }
                        },
                        {
                            $unset: ["_id"]
                        },
                        {
                            $skip: Number(skip)
                        },
                        {
                            $limit: Number(count)
                        },
                    ]
                }
            }
        ];

        let calender_data = await Calender.aggregate(pipeline);
        sendResponse(res, calender_data, "success", true, 200);

    } catch (error) {
        sendResponse(res, {}, `${error}`, false, 500);

    }
}

async function blockMultipleTimeSlots(req, res) {
    try {
        const { isError, errors } = validator(req.body, calenderValidations.blockMultipleTimeSlots);

        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        let { slots, slots_to_delete } = req.body;
        if(slots_to_delete && slots_to_delete.length){      // slots to delete if calender request for edit
            for await(let slot of slots_to_delete){
                await Calender.findByIdAndDelete(slot)
            }
        }

        if (slots && slots.length) {                // New blocked slots to add
            let blocked_slots = [];
            for await (let slot of slots) { 
                slot["userID"] = req?.user?.data?._id;
                if(!slot._id){
                    delete slot._id;
                    let block_slot = await Calender.create(slot);
                    if (block_slot) {
                        blocked_slots.push(block_slot);
                    }
                }
            }
            return sendResponse(res, blocked_slots, "Success", true, 201);
        }
        return sendResponse(res, {}, "Slots lengths must be greater than 0", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export { calender, getCalender, getTimeSlot, getCalenderTimeSlots, getCalenderBlockedSlots, blockMultipleTimeSlots }