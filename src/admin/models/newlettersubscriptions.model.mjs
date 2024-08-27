import mongoose from "mongoose";

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    email : {
        type : String,
    },
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const NewsLetterSubscriptions = mongoose.model('newslettersubscriptions', chatSchema);
export default NewsLetterSubscriptions;
