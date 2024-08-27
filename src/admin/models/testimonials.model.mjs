import mongoose from "mongoose";
import { UserRoles } from "../../user/enums/role.enums.mjs"

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    name: {
        type: String,
    },
    role: {
        type: String,
        enum: [UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER]
    },
    description: {
        type: String,
    },
    media: {
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


const Testimonials = mongoose.model('testimonials', chatSchema);
export default Testimonials;
