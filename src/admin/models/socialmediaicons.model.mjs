import mongoose from "mongoose";
import * as FaqEnums from "../enums/faq.enums.mjs";

const Schema = mongoose.Schema;

const SocialMediaSchema = new Schema({
    title: {
        type: String,
    },
    link: {
        type: String,
    },
    media : {
        type: String,
    },
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const SocialMediaIcons = mongoose.model('socialmediaicons', SocialMediaSchema);
export default SocialMediaIcons;
