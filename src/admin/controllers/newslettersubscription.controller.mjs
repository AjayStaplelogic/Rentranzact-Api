import { sendResponse } from "../../user/helpers/sendResponse.mjs"
import NewsLetterSubscriptions from "../models/newlettersubscriptions.model.mjs";
import { generateXlxs } from "../services/xlxs.service.mjs";

export const getAllSubscriptions = async (req, res) => {
    try {
        let { search, sortBy } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
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
        let pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    id: "$_id",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    email: "$email",
                    status: "$status",
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

        let data = await NewsLetterSubscriptions.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteNewsletterSubscription = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return sendResponse(res, null, "Missing required parameter: id", false, 400);
        }

        const subscription = await NewsLetterSubscriptions.findByIdAndDelete(id);
        return sendResponse(res, null, "Subscription deleted successfully", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const updateNewsletterSubscriptionStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id) {
            return sendResponse(res, null, "Id required", false, 400);
        }

        if (!status) {
            return sendResponse(res, null, "Status required", false, 400);
        }

        const subscription = await NewsLetterSubscriptions.findByIdAndUpdate(id, { status }, { new: true });
        if (subscription) {
            return sendResponse(res, subscription, "Subscription status updated successfully", true, 200);
        }
        return sendResponse(res, null, "Subscription not found", false, 404);

    } catch (error) {
        return sendResponse(res, null, error?.message, false, 500);
    }
}

export const downloadXlxs = async (req, res) => {
    try {
        let { search, sortBy } = req.query;
        let query = {};
        if (search) {
            query.$or = [
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
        let pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    _id: 0,
                    Date: "$createdAt",
                    Email: "$email",
                    Status: "$status",
                }
            },
            {
                $sort: sort_query
            }
        ];

        let data = await NewsLetterSubscriptions.aggregate(pipeline);
        const columnWidths = [
            { wpx: 100 },
            { wpx: 200 },
            { wpx: 100 },
        ];

        const buffer = await generateXlxs(data, "Sheet 1", columnWidths)
        res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="newsletter_subscriptions.xlsx"`)
        return res.send(buffer);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}