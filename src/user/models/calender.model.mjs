// models/User.js

import mongoose from "mongoose";

const calenderSchema = new mongoose.Schema(
    {
        userID: {
            type: String,
            required: true

        },
        id: {
            type: String,
            required: true
        },
        date: {

            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        fulLDay: {
            type: Boolean,
            required: true
        }
    },
    { timestamps: true }
);

// Create the User model from the schema
const Calender = mongoose.model("Calender", calenderSchema);

export { Calender };
