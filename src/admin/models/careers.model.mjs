import mongoose from "mongoose";

const Schema = mongoose.Schema;

const careerSchema = new Schema({
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
    skills : {
        type: String,
    },
    experience : {
        type: String,
    },
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Careers = mongoose.model('Careers', careerSchema);
export default Careers;
