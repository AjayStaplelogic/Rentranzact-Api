import mongoose from "mongoose";
// Define the schema for the User model
const notificationSchema = new mongoose.Schema(
    {
        propertyID: {
            type: String,
            required: true
        },
        renterID: {
            type: String,
            required: true
        },
        notificationHeading: {
            type: String,
            required: true
        },

        notificationBody: {
            type: String,
            required: true
        },

        read: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Create the User model from the schema
const Notification = mongoose.model("notification", notificationSchema);

export { Notification };
