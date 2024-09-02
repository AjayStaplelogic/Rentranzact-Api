import mongoose from "mongoose";

const Schema = mongoose.Schema;

const newsLetterSubscriptionSchema = new Schema({
    email : {
        type : String,
    },
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const NewsLetterSubscriptions = mongoose.model('newslettersubscriptions', newsLetterSubscriptionSchema);
export default NewsLetterSubscriptions;
