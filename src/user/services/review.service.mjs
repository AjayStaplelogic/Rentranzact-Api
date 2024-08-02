import { Reviews } from "../models/reviews.model.mjs";

export const calculate_avg_rating = async (options) => {
    let { type, property_id } = options;
    let query = {
        isDeleted: false,
        status: "accepted"
    };
    let group_by = {}
    if (type == "property") {
        query.type == "property";
        query.property_id = property_id;
        group_by = {
            _id: "$property_id"
        }
    };

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
    if (get_rating && get_rating.length > 0) {
        return get_rating[0];
    }
    return {
        avg_rating: 0,
        total_reviews: 0
    };
}