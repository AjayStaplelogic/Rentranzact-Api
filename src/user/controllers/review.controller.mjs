import { sendResponse } from "../helpers/sendResponse.mjs";
import { Reviews } from "../models/reviews.model.mjs";
import { Property } from "../models/property.model.mjs";
import * as ReviewServices from "../services/review.service.mjs";
import mongoose from "mongoose";
import { EReviewReportStatus, ReviewTypeEnum } from "../enums/review.enum.mjs";

export const addUpdateReview = async (req, res) => {
    try {
        let { type, property_id, review_to_id } = req.body;
        if (!type) {
            return sendResponse(res, {}, "Type reqired", false, 400);
        }

        const query = {
            isDeleted: false,
            user_id: req.user.data._id,
            type: type
        }
        if (type === ReviewTypeEnum.property) {
            if (!property_id) {
                return sendResponse(res, {}, "Property Id reqired", false, 400);
            }

            let get_property = await Property.findById(property_id);
            if (!get_property) {
                return sendResponse(res, {}, "Invalid Property Id", false, 400);
            }
            req.body.landloard_id = get_property.landlord_id;
            query.property_id = property_id;
            delete req.body.review_to_id;   // Just to avoid conflict with other
        };

        if ([ReviewTypeEnum.toRenter, ReviewTypeEnum.toLandlord, ReviewTypeEnum.toPropertyManager].includes(type)) {
            if (!review_to_id) {
                return sendResponse(res, {}, "Review to Id reqired", false, 400);
            }
            query.review_to_id = review_to_id;
            delete req.body.property_id; // Just to avoid conflict with other
        }

        req.body.user_id = req.user.data._id;
        req.body.updated_by = req.user.data._id;

        // To calculate rating
        const total_score = (Number(req.body.answer1) > 0 ? Number(req.body.answer1) : 0)
            + (Number(req.body.answer2) > 0 ? Number(req.body.answer2) : 0)
            + (Number(req.body.answer3) > 0 ? Number(req.body.answer3) : 0)
            + (Number(req.body.answer4) > 0 ? Number(req.body.answer4) : 0)

        req.body.rating = ReviewServices.get_avg_by_rating_numbers(total_score);    // Calculation avg starts
        const update_review = await Reviews.findOneAndUpdate(query, req.body, { new: true, upsert: true });
        if (update_review) {
            const avg_rating = await ReviewServices.calculate_avg_rating(update_review);
            ReviewServices.update_avg_review_rating(update_review, avg_rating);
            return sendResponse(res, {}, "success", true, 200);
        }
        return sendResponse(res, {}, "success", true, 200);

    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getAllReviews = async (req, res) => {
    try {
        let { type, user_id, property_id, landloard_id, review_to_id, search, rating, status, sortBy, report_status } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = { isDeleted: false };
        let query2 = {};
        if (type) { query.type = type };
        if (user_id) { query.user_id = new mongoose.Types.ObjectId(user_id) };
        if (property_id) { query.property_id = new mongoose.Types.ObjectId(property_id) };
        if (landloard_id) { query.landloard_id = new mongoose.Types.ObjectId(landloard_id) };
        if (review_to_id) { query.review_to_id = new mongoose.Types.ObjectId(review_to_id) };
        if (rating) { query.rating = Number(rating) }
        if (status) { query.status = status };
        if (report_status) { query.report_status = report_status };
        let skip = Number(page - 1) * count;
        if (search) {
            query2.$or = [
                { user_name: { $regex: search, $options: 'i' } },
                { property_name: { $regex: search, $options: 'i' } },
                { review: { $regex: search, $options: 'i' } },
                { landloard_name: { $regex: search, $options: 'i' } }
            ]
        }
        let field = "rating";
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
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_details"
                }
            },
            {
                $unwind: {
                    path: "$user_details",
                    preserveNullAndEmptyArrays: true
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
                    path: "$property_details",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "landloard_id",
                    foreignField: "_id",
                    as: "landloard_details"
                }
            },
            {
                $unwind: {
                    path: "$landloard_details",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "review_to_id",
                    foreignField: "_id",
                    as: "review_to_details"
                }
            },
            {
                $unwind: {
                    path: "$review_to_details",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    createdAt: "$createdAt",
                    type: "$type",
                    user_id: "$user_id",
                    property_id: "$property_id",
                    rating: "$rating",
                    review: "$review",
                    isDeleted: "$isDeleted",
                    user_name: "$user_details.fullName",
                    user_image: "$user_details.picture",
                    property_name: "$property_details.propertyName",
                    property_images: "$property_details.images",
                    status: "$status",
                    landloard_id: "$landloard_id",
                    landloard_name: "$landloard_details.fullName",
                    landloard_image: "$landloard_details.picture",

                    review_to_id: "$review_to_id",
                    review_to_name: "$review_to_details.fullName",
                    review_to_image: "$review_to_details.picture",
                    report_status: "$report_status",
                    report_reason: "$report_reason"
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

export const getReviewById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let get_review = await Reviews.findOne({ _id: id, isDeleted: false })
            .populate('user_id')
            .populate('property_id')
            .populate('review_to_id')
            .lean().exec();

        if (get_review) {
            return sendResponse(res, get_review, "success", true, 200);
        }
        return sendResponse(res, {}, "Invalid Id", false, 400);

    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const changeReviewStatus = async (req, res) => {
    try {
        let { id, status } = req.body;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        if (!status) {
            return sendResponse(res, {}, "Status reqired", false, 400);
        }

        if (!["accepted", "rejected"].includes(status)) {
            return sendResponse(res, {}, "Invalid status", false, 400);
        }

        let update_payload = {
            status: status
        };

        if (status == "accepted") {
            update_payload.accepted_at = new Date();
        }

        if (status == "rejected") {
            update_payload.rejected_at = new Date();
        }

        let update_review = await Reviews.findOneAndUpdate({ _id: id, isDeleted: false }, update_payload, { new: true });

        if (update_review) {
            let avg_rating = await ReviewServices.calculate_avg_rating(update_review);
            await ReviewServices.update_avg_review_rating(update_review, avg_rating);
            return sendResponse(res, {}, "success", true, 200);
        }
        return sendResponse(res, {}, "Invalid Id", false, 400);

    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteReview = async (req, res) => {
    try {
        let { id, current_user_id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let update_review = await Reviews.findByIdAndDelete(id);
        if (update_review) {
            let avg_rating = await ReviewServices.calculate_avg_rating(update_review);
            if (update_review.type == "property" && avg_rating) {
                let update_payload = {
                    avg_rating: avg_rating.avg_rating ? avg_rating.avg_rating : 0,
                    total_reviews: avg_rating.total_reviews
                }

                let update_property = await Property.findByIdAndUpdate(update_review.property_id, update_payload);
            }
            activityLog(current_user_id, `deleted review`);
            return sendResponse(res, {}, "success", true, 200);
        }
        return sendResponse(res, {}, "Invalid Id", false, 400);

    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const updateReportStatus = async (req, res) => {
    try {
        let { id, report_status, report_reason, current_user_id } = req.body;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        if (!current_user_id) {
            return sendResponse(res, {}, "Current user Id required", false, 400);
        }

        if (!report_status) {
            return sendResponse(res, {}, "Status reqired", false, 400);
        }

        if (!Object.values(EReviewReportStatus).includes(report_status)) {
            return sendResponse(res, {}, "Invalid status", false, 400);
        }

        const get_review = await Reviews.findOne({
            _id: id,
            isDeleted: false,
        });

        if (get_review) {
            if (get_review.type != ReviewTypeEnum.property) {
                return sendResponse(res, {}, "Only property reviews can be reported", false, 400);
            }

            if (get_review.report_status === report_status) {
                return sendResponse(res, {}, "Review already has this status", false, 400);
            }

            if ([EReviewReportStatus.accepted, EReviewReportStatus.rejected].includes(get_review.report_status)) {
                return sendResponse(res, {}, "Review reported has been finanlised, Can't update further", false, 400);
            }

            let update_payload = {
                report_status: report_status,
            };

            switch (report_status) {
                case EReviewReportStatus.reported:
                    update_payload.reported_at = new Date();
                    update_payload.report_reason = report_reason ?? "";
                    break;
                case EReviewReportStatus.accepted:
                    update_payload.accepted_at = new Date();
                    break;
                case EReviewReportStatus.rejected:
                    update_payload.rejected_at = new Date();
                    break;
            }

            let update_review = await Reviews.findOneAndUpdate({
                _id: id,
                isDeleted: false
            },
                update_payload,
                {
                    new: true
                }
            );

            if (update_review) {
                ReviewServices.sendRatingNotification(update_review, current_user_id, update_review.report_status === EReviewReportStatus.reported ? true : false);
                return sendResponse(res, {}, "success", true, 200);
            }
        }
        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const updateRecommendStatus = async (req, res) => {
    try {
        let { id, report_status, current_user_id } = req.body;

        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        if (!current_user_id) {
            return sendResponse(res, {}, "Current user Id required", false, 400);
        }

        if (!report_status) {
            return sendResponse(res, {}, "Status reqired", false, 400);
        }

        if (![EReviewReportStatus.recommended, EReviewReportStatus.recommendRejected].includes(report_status)) {
            return sendResponse(res, {}, "Invalid status", false, 400);
        }

        const get_review = await Reviews.findOne({
            _id: id,
            isDeleted: false,
        });

        if (get_review) {
            if (get_review.report_status === report_status) {
                return sendResponse(res, {}, "Review already has this status", false, 400);
            }

            if ([EReviewReportStatus.accepted, EReviewReportStatus.rejected, EReviewReportStatus.recommended, EReviewReportStatus.recommendRejected].includes(get_review.report_status)) {
                return sendResponse(res, {}, "Review reported has been finanlised, Can't update further", false, 400);
            }

            let update_payload = {
                report_status: report_status,
            };

            // switch (report_status) {
            //     case EReviewReportStatus.reported:
            //         update_payload.reported_at = new Date();
            //         update_payload.report_reason = report_reason ?? "";
            //         break;
            //     case EReviewReportStatus.accepted:
            //         update_payload.accepted_at = new Date();
            //         break;
            //     case EReviewReportStatus.rejected:
            //         update_payload.rejected_at = new Date();
            //         break;
            // }

            let update_review = await Reviews.findOneAndUpdate({
                _id: id,
                isDeleted: false
            },
                update_payload,
                {
                    new: true
                }
            );

            if (update_review) {
                ReviewServices.sendRatingNotification(update_review, current_user_id,  update_review.report_status === EReviewReportStatus.reported ? true : false);
                return sendResponse(res, {}, "success", true, 200);
            }
        }
        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}