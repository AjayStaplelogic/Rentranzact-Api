import mongoose from "mongoose";
import { ReviewTypeEnum } from "../enums/review.enum.mjs"

const reviewSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: Object.values(ReviewTypeEnum),
        required: true,
        index: true
    },
    user_id: {           // Review given by
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true,
    },
    review_to_id: {           // In case of type = user
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true,
    },
    property_id: {
        type: mongoose.Types.ObjectId,
        ref: "properties",
        index: true
    },
    landloard_id: {           // Review given by
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    review: {
        type: String,
        default: ""
    },
    question1: {
        type: String
    },
    answer1: {
        type: Number,
        min: 0,
        max: 4,
        default: 0
    },
    question2: {
        type: String
    },
    answer2: {
        type: Number,
        min: 0,
        max: 4,
        default: 0
    },
    question3: {
        type: String
    },
    answer3: {
        type: Number,
        min: 0,
        max: 4,
        default: 0
    },
    question4: {
        type: String
    },
    answer4: {
        type: Number,
        min: 0,
        max: 4,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    updated_by: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    accepted_at: {
        type: Date
    },
    rejected_at: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Reviews = mongoose.model('reviews', reviewSchema);
export { Reviews }