import mongoose from "mongoose";
// Define the schema for the User model
const notificationSchema = new mongoose.Schema(
    {
        propertyID: {
            type: String,
            required: true
        },
        userID: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
);

// Create the User model from the schema
const Notification = mongoose.model("notification", notificationSchema);

export { Notification };
