import { sendResponse } from "../helpers/sendResponse.mjs";
import { Reviews } from "../models/reviews.model.mjs";
import { Property } from "../models/property.model.mjs";
import * as ReviewServices from "../services/review.service.mjs";
import mongoose from "mongoose";

export const addUpdateReview = async (req, res) => {
    try {
        let { type, property_id } = req.body;
        if (!type) {
            return sendResponse(res, {}, "Type reqired", false, 400);
        }

        let query = {
            isDeleted: false,
            user_id: req.user.data._id
        }
        if (type == "property") {
            query.type == "property";
            query.property_id = property_id;
        };

        req.body.user_id = req.user.data._id;
        let update_review = await Reviews.findOneAndUpdate(query, req.body, { new: true, upsert: true });
        if (update_review) {
            let avg_rating = await ReviewServices.calculate_avg_rating(update_review);
            if (update_review.type == "property" && avg_rating.avg_rating > 0) {
                let update_payload = {
                    avg_rating: avg_rating.avg_rating,
                    total_reviews: avg_rating.total_reviews
                }

                let update_property = await Property.findByIdAndUpdate(update_review.property_id, update_payload);

                return sendResponse(res, {}, "success", true, 200);
            }
        }
        return sendResponse(res, {}, "success", true, 200);

    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getAllReviews = async (req, res) => {
    try {
        console.log("[Review Listing]")
        let { type, user_id, property_id, search, rating, sortBy } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = { isDeleted: false };
        let query2 = {};
        if (type) { query.type = type };
        if (user_id) { query.user_id = new mongoose.Types.ObjectId(user_id) };
        if (property_id) { query.property_id = new mongoose.Types.ObjectId(property_id) };
        if (rating) { query.rating = Number(rating) }
        let skip = Number(page - 1) * count;
        if (search) {
            query2.$or = [
                { user_name: { $regex: search, $options: 'i' } },
                { property_name: { $regex: search, $options: 'i' } },
                { review: { $regex: search, $options: 'i' } },
            ]
        }
        let field = "rating";
        let order = "desc";
        let sort_query = {};
        if(sortBy){
            field = sortBy.split(' ')[0];
            order = sortBy.split(' ')[1];
        }
        sort_query[field] = order;
        let pipeline = [
            {
                $match: query
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userd_id",
                    foreignField: "_id",
                    as: "user_details"
                }
            },
            {
                $lookup: {
                    from: "properties",
                    localField: "property_id",
                    foreignField: "_id",
                    as: "property_details"
                }
            },
            {
                $unwind: {
                    path: "user_details",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "property_details",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    type: "$type",
                    userd_id: "$userd_id",
                    property_id: "$property_id",
                    rating: "$rating",
                    review: "$review",
                    isDeleted: "$isDeleted",
                    user_name: "$user_details.fullName",
                    user_image: "$user_details.picture",
                    property_name: "$property_details.propertyName",
                    property_images: "$property_details.images",
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
                            $sort : sort_query
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
        let get_reviews = await Reviews.aggregate(pipeline);
        return sendResponse(res, get_reviews, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}