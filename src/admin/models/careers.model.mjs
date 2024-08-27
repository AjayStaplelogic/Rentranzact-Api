import mongoose from "mongoose";

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    title : {               // Job title
        type : String,
    },
    description : {
        type: String,
    },
    opening_count : {       // Number of openings
        type : Number,
        default : 0
    },
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Careers = mongoose.model('Careers', chatSchema);
export default Careers;
