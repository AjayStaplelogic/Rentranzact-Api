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

export const getAllActivityLogs = async(req, res) =>{
    try {
        let { search, sortBy, empID } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};

        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { body: { $regex: search, $options: 'i' } },
            ]
        }

        if(empID){
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
                $unwind : {
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
                    body : {
                        $concat : [
                            "$employee.fullName",
                            " - ",
                            "$body"
                        ]
                    }
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