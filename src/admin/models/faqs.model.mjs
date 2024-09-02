import mongoose from "mongoose";
import * as FaqEnums from "../enums/faq.enums.mjs";

const Schema = mongoose.Schema;

const faqSchema = new Schema({
    category: {
        type: String,
        enum: Object.values(FaqEnums.CATEGORIES),
    },
    question: {
        type: String,
    },
    answer: {
        type: String,
    },
    status: {
        type: String,
        enum: ["draft", "published", "unpublished"],
        default: "draft"
    },
    publishedAt: {
        type: Date,
    },
    unpublishedAt: {
        type: Date,
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Faqs = mongoose.model('faqs', faqSchema);
export default Faqs;
