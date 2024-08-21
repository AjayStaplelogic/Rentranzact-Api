import mongoose from "mongoose";

const activity = new mongoose.Schema(
    {
        empID: {
            type: mongoose.Types.ObjectId,
            ref: "admin"
        },
        body: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

// Create the User model from the schema
const Activity = mongoose.model("activity", activity);

export { Activity };
