import mongoose from "mongoose";
const calenderSchema = new mongoose.Schema(
    {
        userID: {
            type: String,
            required: true

        },
        id: {
            type: String,
            required: false
        },
        date: {

            type: String,
            required: true
        },
        time: {
            type: String,
            required: false
        },
        fullDay: {
            type: Boolean,
            required: true
        }
    },
    { timestamps: true }
);

const Calender = mongoose.model("Calender", calenderSchema);

export { Calender };
