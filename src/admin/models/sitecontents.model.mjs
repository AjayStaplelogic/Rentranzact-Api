import mongoose from "mongoose";

const Schema = mongoose.Schema;

const siteContentSchema = new Schema({
    slug : {
        type: String,
        enum : ["about-us", "privacy-policy", "data-protection", "terms-and-conditions"],
        index : true
    },
    title : {
        type : String,
    },
    content : {
        type: String,
    },
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const SiteContents = mongoose.model('SiteContents', siteContentSchema);
export default SiteContents;
