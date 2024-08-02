import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["property"],
        required: true,
        index : true
    },
    userd_id: {           // Review given by
        type: mongoose.Types.ObjectId,
        ref: "users",
        index : true,
    },
    property_id: {
        type: mongoose.Types.ObjectId,
        ref: "properties",
        index : true
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
        type: String,
        enum: ["good", "very-good", "best", "bad"]
    },
    question2: {
        type: String
    },
    answer2: {
        type: String,
        enum: ["good", "very-good", "best", "bad"]
    },
    question3: {
        type: String
    },
    answer3: {
        type: String,
        enum: ["good", "very-good", "best", "bad"]
    },
    question4: {
        type: String
    },
    answer4: {
        type: String,
        enum: ["good", "very-good", "best", "bad"]
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    updated_by : {
        type : mongoose.Types.ObjectId,
        ref : "users"
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Reviews = mongoose.model('reviews', reviewSchema);
export { Reviews }