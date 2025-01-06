import moment from "moment-timezone";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { Activity } from "../models/activity.model.mjs";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
// async function activity(req, res) {

//     try {
//         const { userID } = req.params;

//         const data = await Activity.find({empID : userID})

//         sendResponse(res, data, "activity fetched successfully", true, 200);

//     } catch (error) {
//         sendResponse(res, data, error, false, 400);
//     }


// }

// export { activity }

export const getAllActivityLogs = async (req, res) => {
    try {
        let { search, sortBy, empID, start_date, end_date, timezone } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        let query2 = {};

        let skip = Number(page - 1) * count;
        if (search) {
            query2.$or = [
                { body: { $regex: search, $options: 'i' } },
            ]
        }

        if (empID) {
            query.empID = new ObjectId(empID);
        }

        let field = "createdAt";
        let order = "desc";
        let sort_query = {};
        if (sortBy) {
            field = sortBy.split(' ')[0];
            order = sortBy.split(' ')[1];
        }
        sort_query[field] = order == "desc" ? -1 : 1;

        timezone = timezone ?? "UTC"

        if (start_date && end_date) {
            query.createdAt = {
                $gte: moment(start_date).tz(timezone, true).startOf("day").toDate(),
                $lte: moment(end_date).tz(timezone, true).endOf("day").toDate()
            }
        } if (start_date && !end_date) {
            query.createdAt = {
                $gte: moment(end_date).tz(timezone, true).endOf("day").toDate()
            }
        } if (!start_date && end_date) {
            query.createdAt = {
                $lte: moment(end_date).tz(timezone, true).endOf("day").toDate()
            }
        }
        
        let pipeline = [
            {
                $match: query
            },
            {
                $lookup: {
                    from: "admins",
                    localField: "empID",
                    foreignField: "_id",
                    as: "employee"
                }
            },
            {
                $unwind: {
                    path: "$employee",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    id: "$_id",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    empID: "$empID",
                    // body: "$body",
                    "employee.fullName": "$employee.fullName",
                    body: {
                        $cond: {
                            if: {
                                $and: {
                                    $eq: [{ $type: "$employee.fullName" }, "string"],
                                    $eq: [{ $type: "$employee.role" }, "string"],
                                }
                            },
                            then: {
                                $concat: [
                                    "$employee.fullName",
                                    " (",
                                    "$employee.role",
                                    ")",
                                    " - ",
                                    "$body"
                                ]
                            },
                            else: "$body"
                        },
                        // $concat: [
                        //     "$employee.fullName",
                        //     " (",
                        //     "$employee.role",
                        //     ")",
                        //     " - ",
                        //     "$body"
                        // ]
                    }
                }
            },
            {
                $match: query2
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
                            $sort: sort_query
                        },
                        {
                            $skip: Number(skip)
                        },
                        {
                            $limit: Number(count)
                        },
                    ],

                }
            }

        ]

        let data = await Activity.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}