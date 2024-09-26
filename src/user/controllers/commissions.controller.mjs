import mongoose from "mongoose";
import { sendResponse } from "../helpers/sendResponse.mjs";
import Commissions from "../models/commissions.model.mjs";
const ObjectId = mongoose.Types.ObjectId;

export const getCommissions = async (req, res) => {
    try {
        const { search, type } = req.query;
        const page = Number(req.query.page || 1);
        const count = Number(req.query.count || 20);
        const sort_key = req.query.sort_key || "createdAt";
        const sort_order = req.query.sort_order || "desc";

        const query = {};
        const skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { property_name: { $regex: search, $options: 'i' } },
            ]
        }

        const sort_query = {};
        sort_query[sort_key] = sort_order == "desc" ? -1 : 1;

        query.to = new ObjectId(req?.user?.data?._id);
        if (type) { query.type = type; }
        const pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    isDeleted: "$isDeleted",
                    type: "$type",
                    from: "$from",
                    to: "$to",
                    property_id: "$property_id",
                    property_name: "$property_name",
                    property_address: "$property_address",
                    property_location: "$property_location",
                    property_images: "$property_images",
                    rent: "$rent",
                    commission: "$commission",
                    commission_per: "$commission_per",
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
                    ]
                }
            }

        ]
        let get_data = await Commissions.aggregate(pipeline);
        return sendResponse(res, get_data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}
