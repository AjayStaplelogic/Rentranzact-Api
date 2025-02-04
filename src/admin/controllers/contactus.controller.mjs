import { sendResponse } from "../../user/helpers/sendResponse.mjs"
import ContactUs from "../../user/models/contactus.model.mjs";
import moment from "moment-timezone";

export const getAllRequests = async (req, res) => {
    try {
        let { search, sortBy, from, to, timezone } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ]
        }
        let field = "createdAt";
        let order = "desc";
        let sort_query = {};
        if (sortBy) {
            field = sortBy.split(' ')[0];
            order = sortBy.split(' ')[1];
        }
        sort_query[field] = order == "desc" ? -1 : 1;


        if (from && to) {
            query.createdAt = {
                $gte: moment(from).tz(timezone, true).startOf("day").toDate(),
                $lte: moment(to).tz(timezone, true).endOf("day").toDate()
            }
        } if (from && !to) {
            query.createdAt = {
                $gte: moment(to).tz(timezone, true).endOf("day").toDate()
            }
        } if (!from && to) {
            query.createdAt = {
                $lte: moment(to).tz(timezone, true).endOf("day").toDate()
            }
        }

        let pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    id: "$_id",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    name: "$name",
                    email: "$email",
                    phone: "$phone",
                    company: "$company",
                    message: "$message",
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

        let data = await ContactUs.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getRequestById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await ContactUs.findById(id);
        if (data) {
            return sendResponse(res, data, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}
