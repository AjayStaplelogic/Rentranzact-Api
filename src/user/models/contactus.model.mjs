import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ContactUsSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String
    },
    company: {
        type: String
    },
    message: {
        type: String
    },

}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const ContactUs = mongoose.model('ContactUs', ContactUsSchema);
export default ContactUs;
