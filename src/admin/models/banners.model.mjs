import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    title : {
        type : String,
    },
    media : {
        type: String,
    },
    content : {
        type: String,
    },
    status : {
        type : String,
        enum : ["draft", "published", "unpublished"],
        default : "draft"
    },
    publishedAt : {
        type : Date,
    },
    unpublishedAt : {
        type : Date,
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Banners = mongoose.model('Banners', bannerSchema);
export default Banners;
