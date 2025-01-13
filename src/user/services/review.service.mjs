import { Reviews } from "../models/reviews.model.mjs";
import { ReviewTypeEnum, RatingFormula, EReviewStatus, EReviewReportStatus } from "../enums/review.enum.mjs";
import { User } from "../models/user.model.mjs";
import { Property } from "../models/property.model.mjs";
import { Types } from "mongoose";
import { ENOTIFICATION_REDIRECT_PATHS } from "../enums/notification.enum.mjs";
import { Admin } from "../../admin/models/admin.model.mjs";
import { EADMINROLES } from "../../admin/enums/permissions.enums.mjs";
import * as NotificationService from "../services/notification.service.mjs";
import activityLog from "../../admin/helpers/activityLog.mjs";

const ObjectId = Types.ObjectId;

/**
 * @description To calculate average rating and total review
 * @param {object} options This should the accepted review object
 * @returns {object} contains calculated avg_rating and total_review
 */
export const calculate_avg_rating = async (options) => {
    let { type, property_id, review_to_id } = options;
    let query = {
        isDeleted: false,
        status: EReviewStatus.accepted,
        type: type
    };
    let group_by = {}
    if (type === ReviewTypeEnum.property) {
        // query.type == "property";
        query.property_id = new ObjectId(property_id);
        group_by = {
            _id: "$property_id"
        }
        delete query.review_to_id;
    };

    if ([ReviewTypeEnum.toRenter, ReviewTypeEnum.toLandlord, ReviewTypeEnum.toPropertyManager].includes(type)) {
        query.review_to_id = new ObjectId(review_to_id);
        delete query.property_id; // Just to avoid conflict with other
        group_by = {
            _id: "$review_to_id"
        }
    }

    console.log(query, '===query')
    let pipeline = [
        {
            $match: query
        },
        {
            $addFields: {
                review_count: {
                    $cond: {
                        if: {
                            $eq: ["$review", ""]
                        },
                        then: 0,
                        else: 1
                    }
                }
            }
        },
        {
            $group: {
                _id: group_by,
                avg_rating: { $avg: "$rating" },
                total_reviews: { $sum: "$review_count" }
            }
        }
    ]

    let get_rating = await Reviews.aggregate(pipeline);
    console.log(get_rating, '===get_rating')
    if (get_rating && get_rating.length > 0) {
        return get_rating[0];
    }
    return {
        avg_rating: 0,
        total_reviews: 0
    };
}

/**
 * @description Use to update average rating and total review in final table
 * @param {object} update_review This should the accepted review object
 * @param {object} avg_rating This should be the obect containing avg_rating and  total_reviews
 * @return {void} returns nothing
 */
export const update_avg_review_rating = async (update_review, avg_rating) => {
    try {
        if (update_review) {
            let update_payload = {}
            if (update_review.type === ReviewTypeEnum.property && avg_rating.avg_rating > 0) {
                update_payload.avg_rating = avg_rating.avg_rating;
                update_payload.total_reviews = avg_rating.total_reviews;
                let update_property = await Property.findByIdAndUpdate(update_review.property_id, update_payload);
            }

            if ([ReviewTypeEnum.toRenter, ReviewTypeEnum.toLandlord, ReviewTypeEnum.toPropertyManager].includes(update_review.type) && avg_rating.avg_rating > 0) {
                if (ReviewTypeEnum.toRenter) {
                    update_payload.renter_avg_rating = avg_rating.avg_rating;
                    update_payload.renter_total_reviews = avg_rating.total_reviews;
                } else if (ReviewTypeEnum.toLandlord) {
                    update_payload.landlord_avg_rating = avg_rating.avg_rating;
                    update_payload.landlord_total_reviews = avg_rating.total_reviews;
                } else if (ReviewTypeEnum.toPropertyManager) {
                    update_payload.pm_avg_rating = avg_rating.avg_rating;
                    update_payload.pm_total_reviews = avg_rating.total_reviews;
                }
                let update_property = await User.findByIdAndUpdate(update_review.review_to_id, update_payload);
            }
        }
    } catch (error) {
        throw error;
    }
}

/**
 * @description Use to get the average stars rating with scores
 * @param {number} score 
 * @returns {number} Return the average rating according to the score
 */
export const get_avg_by_rating_numbers = (score = 0) => {
    for (const [key, value] of Object.entries(RatingFormula)) {
        if (score >= value.min && score <= value.max) {
            return value.stars; // Return the name of the rating
        }
    }
    return 0;
}
/**
 * When review updated sending notification to the users
 * 
 * @param {object} reviewData containing review object
 * @param {string} updatedBy id of the user or admin who updated the review data
 * @param {boolean} isUpdatedByUser true if updated by user otherwise false
 * @returns {void} Nothing
 */
export const sendRatingNotification = (reviewData, updatedBy, isUpdatedByUser = false) => {
    let Model = isUpdatedByUser === true ? User : Admin;
    Model.findById(updatedBy).then(async get_updated_by_details => {
        let get_property = await Property.findById(reviewData.property_id);

        const notification_payload = {};

        // Send notification to landlord
        notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.review_view;
        notification_payload.notificationHeading = "";
        notification_payload.notificationBody = ``;
        notification_payload.review_id = reviewData?._id ?? null;
        notification_payload.is_send_to_admin = true;
        const query = {
            isDeleted: false
        };

        switch (reviewData.report_status) {
            case EReviewReportStatus.reported:
                notification_payload.notificationHeading = `${get_updated_by_details?.fullName ?? ""} reported review. Please review and recommend for approval`;
                notification_payload.notificationBody = `${get_updated_by_details?.fullName ?? ""} reported review. Please review and recommend for approval`;
                query.role = EADMINROLES.REVIEWER_EMPLOYEE;
                break;

            case EReviewReportStatus.recommended:
                notification_payload.notificationHeading = `${get_updated_by_details?.fullName ?? ""} recommended review for deletion. Please review and approve`;
                notification_payload.notificationBody = `${get_updated_by_details?.fullName ?? ""} recommended review for deletion. Please review and approve`;
                query.role = EADMINROLES.REVIEWER_ADMIN;
                activityLog(updatedBy, `recommended review deletion for property '${get_property?.propertyName ?? ""}'`);
                break;

            case EReviewReportStatus.recommendRejected:
                activityLog(updatedBy, `rejected review deletion request for property '${get_property?.propertyName ?? ""}'`);
                break;

            case EReviewReportStatus.accepted:
                notification_payload.notificationHeading = `${get_updated_by_details?.fullName ?? ""} approved review for deletion. Please review and delete`;
                notification_payload.notificationBody = `${get_updated_by_details?.fullName ?? ""} approved review for deletion. Please review and delete`;
                query.role = EADMINROLES.SUPER_ADMIN;
                activityLog(updatedBy, `approved review deletion recommendation for property '${get_property?.propertyName ?? ""}'`);
                break;

            case EReviewReportStatus.rejected:
                activityLog(updatedBy, `rejected review deletion recommendation for property '${get_property?.propertyName ?? ""}'`);
                break;
        }

        if (query.role) {
            Admin.find(query).then((adminUsers) => {
                for (let admin of adminUsers) {
                    notification_payload.send_to = admin._id;
                    const metadata = {
                        "review_id": notification_payload.review_id.toString(),
                        "redirectTo": notification_payload.redirect_to
                    };

                    NotificationService.createNotification(notification_payload, metadata, admin);
                }
            });
        }
    });
}